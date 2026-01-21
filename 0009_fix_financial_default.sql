-- MIGRATION: 0009_Fix_Financial_Defaults
-- description: Explicitly sets defaults for FinancialTransaction to prevent NULL tenant/user IDs.

-- 1. Apply Defaults Forcefully
ALTER TABLE public."FinancialTransaction" 
    ALTER COLUMN tenant_id SET DEFAULT public.current_tenant_id(),
    ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Verify RLS Policies (Just to be safe)
DROP POLICY IF EXISTS "Tenant Isolation Select" ON public."FinancialTransaction";
CREATE POLICY "Tenant Isolation Select" ON public."FinancialTransaction" FOR SELECT USING (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "Tenant Isolation Insert" ON public."FinancialTransaction";
CREATE POLICY "Tenant Isolation Insert" ON public."FinancialTransaction" FOR INSERT WITH CHECK (tenant_id = public.current_tenant_id());

DROP POLICY IF EXISTS "Tenant Isolation Delete" ON public."FinancialTransaction";
CREATE POLICY "Tenant Isolation Delete" ON public."FinancialTransaction" FOR DELETE USING (tenant_id = public.current_tenant_id());

-- 3. Insert a Test Record (To verify it works immediately)
INSERT INTO public."FinancialTransaction" (description, amount, type, category, status, date)
VALUES ('Teste de Correção (Automático)', 1.00, 'income', 'Outros', 'paid', CURRENT_DATE);

-- 4. Check the results
SELECT id, description, tenant_id FROM public."FinancialTransaction";
