-- Add observations column to FinancialTransaction table
ALTER TABLE "FinancialTransaction" ADD COLUMN IF NOT EXISTS observations text;
