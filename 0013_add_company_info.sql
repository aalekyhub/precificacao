-- Add company information columns to Settings table
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS company_email text;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS company_phone text;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS company_address text;
ALTER TABLE "Settings" ADD COLUMN IF NOT EXISTS company_website text;
