-- FIX RLS FOR PRODUCTS
-- This script resets the security policies for the Produto table to ensure isolation.

-- 1. Ensure user_id defaults to the logged-in user
ALTER TABLE "Produto" ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 2. Force Enable RLS
ALTER TABLE "Produto" ENABLE ROW LEVEL SECURITY;

-- 3. Drop ALL potential existing policies (Clean Slate)
DROP POLICY IF EXISTS "Users can view own data" ON "Produto";
DROP POLICY IF EXISTS "Users can insert own data" ON "Produto";
DROP POLICY IF EXISTS "Users can update own data" ON "Produto";
DROP POLICY IF EXISTS "Users can delete own data" ON "Produto";

-- Common default policies from Supabase UI that might be overriding ours
DROP POLICY IF EXISTS "Enable read access for all users" ON "Produto";
DROP POLICY IF EXISTS "Enable insert for all users" ON "Produto";
DROP POLICY IF EXISTS "Enable update for all users" ON "Produto";
DROP POLICY IF EXISTS "Enable delete for all users" ON "Produto";
DROP POLICY IF EXISTS "Public Access" ON "Produto";

-- 4. Create Strict Policies
CREATE POLICY "Users can view own data" ON "Produto" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON "Produto" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON "Produto" FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON "Produto" FOR DELETE USING (auth.uid() = user_id);

-- 5. (Optional) Fix existing NULL records if any (Assign to current user running query? No, dangerous. Left alone).
-- If you want to claim "orphan" products for yourself, run:
-- UPDATE "Produto" SET user_id = auth.uid() WHERE user_id IS NULL;
