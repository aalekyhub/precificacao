-- MIGRATION: 0005_Fix_Tenant_Defaults_And_Policies
-- description: Adds DEFAULT current_tenant_id() to all business tables and ensures strict RLS.

-- 1. Helper Function to fix a table
CREATE OR REPLACE FUNCTION public.fix_tenant_setup(table_name text) RETURNS void AS $$
BEGIN
    -- Add DEFAULT if not exists (This ensures frontend doesn't need to send tenant_id)
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN tenant_id SET DEFAULT public.current_tenant_id()', table_name);

    -- Ensure RLS is enabled
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);

    -- Re-create Select Policy (Force refresh)
    EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Select" ON public.%I', table_name);
    EXECUTE format('CREATE POLICY "Tenant Isolation Select" ON public.%I FOR SELECT USING (tenant_id = public.current_tenant_id())', table_name);

    -- Re-create Insert Policy
    EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Insert" ON public.%I', table_name);
    EXECUTE format('CREATE POLICY "Tenant Isolation Insert" ON public.%I FOR INSERT WITH CHECK (tenant_id = public.current_tenant_id())', table_name);

     -- Re-create Update Policy
    EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Update" ON public.%I', table_name);
    EXECUTE format('CREATE POLICY "Tenant Isolation Update" ON public.%I FOR UPDATE USING (tenant_id = public.current_tenant_id())', table_name);

     -- Re-create Delete Policy
    EXECUTE format('DROP POLICY IF EXISTS "Tenant Isolation Delete" ON public.%I', table_name);
    EXECUTE format('CREATE POLICY "Tenant Isolation Delete" ON public.%I FOR DELETE USING (tenant_id = public.current_tenant_id())', table_name);
END;
$$ LANGUAGE plpgsql;

-- 2. Apply to all tables
SELECT fix_tenant_setup('Settings');
SELECT fix_tenant_setup('FixedCost');
SELECT fix_tenant_setup('Material');
SELECT fix_tenant_setup('Produto');
SELECT fix_tenant_setup('Contact');
SELECT fix_tenant_setup('Order');
SELECT fix_tenant_setup('FinancialTransaction');
SELECT fix_tenant_setup('OrderItem');
SELECT fix_tenant_setup('ProductMaterial');
SELECT fix_tenant_setup('BOMItem');
SELECT fix_tenant_setup('ProcessoEtapa');

-- 3. Validation: Ensure user has a profile (Safety Check)
-- This repeats the logic from 0004 just to be absolutely sure the current user is covered
DO $$ 
DECLARE 
  existing_user RECORD;
  new_tenant_id uuid;
BEGIN
  FOR existing_user IN 
    SELECT id, email FROM auth.users
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = existing_user.id) THEN
        INSERT INTO public.tenants (name, email)
        VALUES ('Empresa de ' || existing_user.email, existing_user.email)
        RETURNING id INTO new_tenant_id;

        INSERT INTO public.profiles (user_id, tenant_id, role)
        VALUES (existing_user.id, new_tenant_id, 'admin');
    END IF;
  END LOOP;
END $$;

-- 4. Clean up helper
DROP FUNCTION public.fix_tenant_setup(text);
