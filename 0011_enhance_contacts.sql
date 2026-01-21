-- MIGRATION: 0011_Enhance_Contacts
-- description: Adds columns for CPF/CNPJ and detailed address to the Contact table.

ALTER TABLE public."Contact"
ADD COLUMN IF NOT EXISTS document text, -- CPF or CNPJ
ADD COLUMN IF NOT EXISTS document_type text, -- 'CPF' or 'CNPJ' or 'OTHER'
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS street text,
ADD COLUMN IF NOT EXISTS number text,
ADD COLUMN IF NOT EXISTS neighborhood text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS complement text;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Contact';
