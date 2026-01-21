-- MIGRATION SCRIPT: Multi-tenancy & Financial Control
-- Run this in your Supabase SQL Editor

-- ==============================================================================
-- PART 1: MULTI-TENANCY (Add user_id and RLS)
-- ==============================================================================

-- 1.1 Helper function to add user_id and RLS policy safely
create or replace function enable_rls_for_table(table_name text) returns void as $$
begin
    -- Add user_id column if it doesn't exist
    execute format('alter table public.%I add column if not exists user_id uuid references auth.users(id) default auth.uid()', table_name);

    -- Enable RLS
    execute format('alter table public.%I enable row level security', table_name);

    -- Drop existing policies to avoid conflicts (optional, careful with this in prod)
    execute format('drop policy if exists "Users can view own data" on public.%I', table_name);
    execute format('drop policy if exists "Users can insert own data" on public.%I', table_name);
    execute format('drop policy if exists "Users can update own data" on public.%I', table_name);
    execute format('drop policy if exists "Users can delete own data" on public.%I', table_name);
    execute format('drop policy if exists "Enable all access for all users" on public.%I', table_name); -- Removal of old open policy

    -- Create new restrictive policies
    execute format('create policy "Users can view own data" on public.%I for select using (auth.uid() = user_id)', table_name);
    execute format('create policy "Users can insert own data" on public.%I for insert with check (auth.uid() = user_id)', table_name);
    execute format('create policy "Users can update own data" on public.%I for update using (auth.uid() = user_id)', table_name);
    execute format('create policy "Users can delete own data" on public.%I for delete using (auth.uid() = user_id)', table_name);
end;
$$ language plpgsql;

-- 1.2 Apply to existing tables (based on your schema image)
select enable_rls_for_table('Settings');
select enable_rls_for_table('FixedCost');
select enable_rls_for_table('Material');
select enable_rls_for_table('Produto');
select enable_rls_for_table('Contact');
select enable_rls_for_table('Order');

-- Note: Child tables like OrderItem, BOMItem, ProductMaterial often don't strictly need RLS if parent handles access, 
-- but identifying them by user_id is safer for direct queries.
select enable_rls_for_table('OrderItem');
select enable_rls_for_table('ProductMaterial');
select enable_rls_for_table('BOMItem');
select enable_rls_for_table('ProcessoEtapa');


-- ==============================================================================
-- PART 2: FINANCIAL CONTROL
-- ==============================================================================

create table if not exists public."FinancialTransaction" (
    id uuid not null default gen_random_uuid(),
    user_id uuid references auth.users(id) default auth.uid(),
    description text not null,
    amount numeric not null default 0,
    type text not null check (type in ('income', 'expense')), -- 'income' (Receita), 'expense' (Despesa)
    category text, -- e.g., 'Venda', 'Aluguel', 'Material', 'Outros'
    status text default 'paid', -- 'paid' (Pago), 'pending' (Pendente)
    date date default current_date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);

-- Enable RLS for FinancialTransaction
select enable_rls_for_table('FinancialTransaction');

-- ==============================================================================
-- PART 3: CLEANUP
-- ==============================================================================

-- Drop the helper function 
drop function enable_rls_for_table(text);

