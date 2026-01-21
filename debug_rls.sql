-- DIAGNOSTIC SCRIPT (Corrected)
-- Run this to check if RLS is enabled and if products have user_ids

-- 1. Check if RLS is enabled on Produto
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'Produto';

-- 2. Check a few products to see if user_id is NULL or populated
SELECT id, description, user_id FROM "Produto" LIMIT 5;

-- 3. Check existing policies on Produto
select * from pg_policies where tablename = 'Produto';
