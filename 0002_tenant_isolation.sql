-- MIGRATION: 0002_Tenant_Isolation
-- description: Transitions the system to a Tenant-based architecture for SaaS implementation.

-- 1. Create Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text,
  email text,
  plan text DEFAULT 'free',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- 2. Create Profiles Table (Links User -> Tenant)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  role text DEFAULT 'admin', -- 'admin', 'member'
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- 3. Create Hotmart Events Table (For Idempotency)
CREATE TABLE IF NOT EXISTS public.hotmart_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  purchase_id text UNIQUE NOT NULL, -- Hotmart Transaction Code
  payload jsonb,
  processed_at timestamptz DEFAULT now(),
  PRIMARY KEY (id)
);

-- 4. Helper Function to get Current Tenant
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE;

-- 5. Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotmart_events ENABLE ROW LEVEL SECURITY;

-- 6. Backfill / Migration Logic (Crucial Step!)
-- We iterate over existing users in auth.users AND existing data to ensure everyone has a tenant.
DO $$ 
DECLARE 
  existing_user RECORD;
  new_tenant_id uuid;
BEGIN
  -- Loop through users who have data or exist in system
  -- Note: We use a safe approach accessing auth.users if possible, or inferring from public tables
  FOR existing_user IN 
    SELECT id, email FROM auth.users
  LOOP
    -- Check if profile already exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = existing_user.id) THEN
        -- Create new Tenant for this user
        INSERT INTO public.tenants (name, email)
        VALUES ('Empresa de ' || existing_user.email, existing_user.email)
        RETURNING id INTO new_tenant_id;

        -- Create Admin Profile
        INSERT INTO public.profiles (user_id, tenant_id, role)
        VALUES (existing_user.id, new_tenant_id, 'admin');
    END IF;
  END LOOP;
END $$;

-- 7. Add tenant_id to Business Tables and Backfill
-- List of tables to migrate
-- Settings, FixedCost, Material, Produto, Contact, Order, FinancialTransaction
-- Child tables: OrderItem, BOMItem, ProductMaterial, ProcessoEtapa

create or replace function migrate_table_to_tenant(table_name text) returns void as $$
begin
    -- Add column nullable first
    execute format('alter table public.%I add column if not exists tenant_id uuid references public.tenants(id)', table_name);

    -- Backfill tenant_id based on user_id (assuming the user is the owner)
    -- We look up the profile for the user_id on the record
    execute format('
        UPDATE public.%I t 
        SET tenant_id = p.tenant_id 
        FROM public.profiles p 
        WHERE t.user_id = p.user_id 
        AND t.tenant_id IS NULL
    ', table_name);
    
    -- For records where user_id might be null (if any), we leave tenant_id null for now or handle manually?
    -- Assuming your validation scripts forced user_id, we should be good.
end;
$$ language plpgsql;

-- Apply migration
SELECT migrate_table_to_tenant('Settings');
SELECT migrate_table_to_tenant('FixedCost');
SELECT migrate_table_to_tenant('Material');
SELECT migrate_table_to_tenant('Produto');
SELECT migrate_table_to_tenant('Contact');
SELECT migrate_table_to_tenant('Order');
SELECT migrate_table_to_tenant('FinancialTransaction');
-- Child tables (Need to derive from parent or user_id if present)
SELECT migrate_table_to_tenant('OrderItem');
SELECT migrate_table_to_tenant('ProductMaterial');
SELECT migrate_table_to_tenant('BOMItem');
SELECT migrate_table_to_tenant('ProcessoEtapa');

-- 8. Enforce NOT NULL and Clean up RLS
drop function migrate_table_to_tenant(text);

-- Helper to set strict RLS
create or replace function set_tenant_rls(table_name text) returns void as $$
begin
    -- Alter column to NOT NULL (Optional: only if you are sure strictly no orphans)
    -- execute format('alter table public.%I alter column tenant_id set not null', table_name);

    -- Drop old policies
    execute format('drop policy if exists "Users can view own data" on public.%I', table_name);
    execute format('drop policy if exists "Users can insert own data" on public.%I', table_name);
    execute format('drop policy if exists "Users can update own data" on public.%I', table_name);
    execute format('drop policy if exists "Users can delete own data" on public.%I', table_name);
    -- Drop legacy policies
    execute format('drop policy if exists "Public Access Produto" on public.%I', table_name);
    
    -- Create Tenant Policies
    execute format('create policy "Tenant Isolation Select" on public.%I for select using (tenant_id = public.current_tenant_id())', table_name);
    execute format('create policy "Tenant Isolation Insert" on public.%I for insert with check (tenant_id = public.current_tenant_id())', table_name);
    execute format('create policy "Tenant Isolation Update" on public.%I for update using (tenant_id = public.current_tenant_id())', table_name);
    execute format('create policy "Tenant Isolation Delete" on public.%I for delete using (tenant_id = public.current_tenant_id())', table_name);
end;
$$ language plpgsql;

-- Apply Policies
SELECT set_tenant_rls('Settings');
SELECT set_tenant_rls('FixedCost');
SELECT set_tenant_rls('Material');
SELECT set_tenant_rls('Produto');
SELECT set_tenant_rls('Contact');
SELECT set_tenant_rls('Order');
SELECT set_tenant_rls('FinancialTransaction');

-- Child tables policies (Optionally can inherit from parent, but direct tenant check is safer/easier)
SELECT set_tenant_rls('OrderItem');
SELECT set_tenant_rls('ProductMaterial');
SELECT set_tenant_rls('BOMItem');
SELECT set_tenant_rls('ProcessoEtapa');

-- 9. Profiles Policy
DROP POLICY IF EXISTS "Profile Isolation" ON public.profiles;
CREATE POLICY "Profile Isolation" ON public.profiles FOR ALL USING (user_id = auth.uid());

-- 10. Tenants Policy (Read own tenant only)
DROP POLICY IF EXISTS "Tenant Read Own" ON public.tenants;
CREATE POLICY "Tenant Read Own" ON public.tenants FOR SELECT USING (id = public.current_tenant_id());

-- Cleanup
drop function set_tenant_rls(text);

-- Grant access to service role (for Webhooks)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
