-- REMOVE PUBLIC ACCESS POLICY
-- The diagnostic showed a policy named "Public Access Produto" that allows everyone to see everything.
-- We must delete it to enforce privacy.

DROP POLICY IF EXISTS "Public Access Produto" ON "Produto";

-- Just in case there are others with similar names:
DROP POLICY IF EXISTS "Public Access" ON "Produto";
DROP POLICY IF EXISTS "Enable all access for all users" ON "Produto";

-- Verify that only strict policies remain (optional check)
-- SELECT * FROM pg_policies WHERE tablename = 'Produto';
