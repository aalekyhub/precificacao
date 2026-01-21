-- Enable ON DELETE CASCADE for all user_id foreign keys
-- This allows deleting a user from Authentication to automatically delete all their related data

-- Settings
ALTER TABLE "Settings" DROP CONSTRAINT IF EXISTS "Settings_user_id_fkey";
ALTER TABLE "Settings" ADD CONSTRAINT "Settings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- FixedCost
ALTER TABLE "FixedCost" DROP CONSTRAINT IF EXISTS "FixedCost_user_id_fkey";
ALTER TABLE "FixedCost" ADD CONSTRAINT "FixedCost_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Material
ALTER TABLE "Material" DROP CONSTRAINT IF EXISTS "Material_user_id_fkey";
ALTER TABLE "Material" ADD CONSTRAINT "Material_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Produto
ALTER TABLE "Produto" DROP CONSTRAINT IF EXISTS "Produto_user_id_fkey";
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Order
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_user_id_fkey";
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Contact
ALTER TABLE "Contact" DROP CONSTRAINT IF EXISTS "Contact_user_id_fkey";
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- OrderItem
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_user_id_fkey";
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ProductMaterial
ALTER TABLE "ProductMaterial" DROP CONSTRAINT IF EXISTS "ProductMaterial_user_id_fkey";
ALTER TABLE "ProductMaterial" ADD CONSTRAINT "ProductMaterial_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- BOMItem
ALTER TABLE "BOMItem" DROP CONSTRAINT IF EXISTS "BOMItem_user_id_fkey";
ALTER TABLE "BOMItem" ADD CONSTRAINT "BOMItem_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ProcessoEtapa
ALTER TABLE "ProcessoEtapa" DROP CONSTRAINT IF EXISTS "ProcessoEtapa_user_id_fkey";
ALTER TABLE "ProcessoEtapa" ADD CONSTRAINT "ProcessoEtapa_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- FinancialTransaction
ALTER TABLE "FinancialTransaction" DROP CONSTRAINT IF EXISTS "FinancialTransaction_user_id_fkey";
ALTER TABLE "FinancialTransaction" ADD CONSTRAINT "FinancialTransaction_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
