-- MIGRATION: 0010_Add_Observations_Column
-- description: Adds the missing 'observations' column to FinancialTransaction table.

ALTER TABLE public."FinancialTransaction"
ADD COLUMN IF NOT EXISTS observations text;

-- Verify it worked
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'FinancialTransaction' AND column_name = 'observations';
