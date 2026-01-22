-- Add missing fields to Order table for Quotes functionality
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS extra_costs numeric default 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS discount numeric default 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS notes text;

-- Ensure RLS policies cover these new columns (implicitly covered by "for all using (true)")
