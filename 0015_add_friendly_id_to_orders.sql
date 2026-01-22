-- Add sequential display_id to Order table
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS display_id SERIAL;

-- If you want to start from a specific number (e.g. 1000), uncomment below:
-- ALTER SEQUENCE "Order_display_id_seq" RESTART WITH 1000;
