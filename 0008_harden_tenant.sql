-- MIGRATION: 0008_Harden_Tenant_Func
-- description: Updates helper function to be Security Definer (bypass RLS) and enforces NOT NULL.

-- 1. Update Helper Function to be SECURITY DEFINER
-- This ensures the function can ALWAYS read provisions, even if RLS is acting up.
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Enforce NOT NULL on FinancialTransaction tenant_id
-- We first clean any remaining nulls (safety)
DELETE FROM public."FinancialTransaction" WHERE tenant_id IS NULL;

-- Now enforce constraint
ALTER TABLE public."FinancialTransaction" ALTER COLUMN tenant_id SET NOT NULL;

-- 3. Verify RLS is actually ON
ALTER TABLE public."FinancialTransaction" ENABLE ROW LEVEL SECURITY;
