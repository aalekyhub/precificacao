-- DEBUG: Test Manual Insertion
-- This script tries to insert a record exactly like the App does to check if the Database allows it.

-- 1. Check if the current user has a Tenant ID resolved
SELECT auth.uid() as "Meus ID (Auth)", public.current_tenant_id() as "Meu Tenant ID";

-- 2. Try to Insert (Simulating the App)
INSERT INTO public."FinancialTransaction" (description, amount, type, category, status, date)
VALUES ('Teste Manual SQL', 50.00, 'expense', 'Outros', 'paid', CURRENT_DATE)
RETURNING *;

-- If this fails, the output will tell us WHY (RLS, constrain, etc).
