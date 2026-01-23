-- MIGRATION: 0017_Robust_Financial_Control
-- description: Adds periodicity, payment method, and recurring status to FinancialTransaction.

-- 1. Add new columns
ALTER TABLE public."FinancialTransaction" 
    ADD COLUMN IF NOT EXISTS periodicity text DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'Other',
    ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT false;

-- 2. Add constraint for periodicity if needed (optional but good practice)
-- ALTER TABLE public."FinancialTransaction" 
--     ADD CONSTRAINT financial_transaction_periodicity_check 
--     CHECK (periodicity IN ('none', 'monthly', 'quarterly', 'semiannual', 'annual'));

-- 3. Confirmation Message
SELECT 'Schema financeiro atualizado com sucesso!' as status;
