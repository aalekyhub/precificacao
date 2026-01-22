-- Add company_cnpj column to Settings table
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS company_cnpj text;
