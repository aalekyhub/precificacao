-- MIGRATION: 0006_Cleanup_Orphans
-- description: Removes legacy data that acts as "ghost" duplicates (tenant_id IS NULL).
-- These records are not visible in the application due to RLS, but clutter the database dashboard.

-- Main Business Tables
DELETE FROM public."Material" WHERE tenant_id IS NULL;
DELETE FROM public."FixedCost" WHERE tenant_id IS NULL;
DELETE FROM public."Produto" WHERE tenant_id IS NULL;
DELETE FROM public."Contact" WHERE tenant_id IS NULL;
DELETE FROM public."Order" WHERE tenant_id IS NULL;
DELETE FROM public."FinancialTransaction" WHERE tenant_id IS NULL;
DELETE FROM public."Equipments" WHERE tenant_id IS NULL;

-- Child Tables (Cascading cleanup)
DELETE FROM public."OrderItem" WHERE tenant_id IS NULL;
DELETE FROM public."BOMItem" WHERE tenant_id IS NULL;
DELETE FROM public."ProcessoEtapa" WHERE tenant_id IS NULL;
DELETE FROM public."ProductMaterial" WHERE tenant_id IS NULL;

-- Verification
-- After running this, only records belonging to an actual Company (Tenant) will remain.
