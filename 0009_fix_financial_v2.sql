-- MIGRATION: 0009_Fix_Financial_Defaults_V2
-- description: Explicitly sets defaults for FinancialTransaction.
-- NOTE: We removed the "Insert Test" aimed at the SQL Editor to avoid "User Not Logged In" errors.

-- 1. Apply Defaults Forcefully
-- This ensures that when the APP sends a transaction, the DB automatically fills the tenant_id.
ALTER TABLE public."FinancialTransaction" 
    ALTER COLUMN tenant_id SET DEFAULT public.current_tenant_id(),
    ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Verify RLS Policies (Just to be safe - refreshing them)
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public."FinancialTransaction";
CREATE POLICY "Tenant Isolation Select" ON public."FinancialTransaction" FOR SELECT USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "Tenant Isolation Insert" ON public."FinancialTransaction";
CREATE POLICY "Tenant Isolation Insert" ON public."FinancialTransaction" FOR INSERT WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "Tenant Isolation Delete" ON public."FinancialTransaction";
CREATE POLICY "Tenant Isolation Delete" ON public."FinancialTransaction" FOR DELETE USING (tenant_id = public.current_tenant_id());

-- 3. Confirmation Message
SELECT 'Defaults aplicados com sucesso! Pode testar no site.' as status;
