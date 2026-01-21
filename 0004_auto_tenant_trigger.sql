-- MIGRATION: 0004_Auto_Tenant_Trigger
-- description: Adds a trigger to automatically create a tenant and profile for new users (Sign Up flow).

-- 1. Create the Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  new_tenant_id uuid;
BEGIN
  -- Create a new default tenant for the user
  INSERT INTO public.tenants (name, email)
  VALUES ('Empresa de ' || new.email, new.email)
  RETURNING id INTO new_tenant_id;

  -- Create the profile linking user to tenant
  INSERT INTO public.profiles (user_id, tenant_id, role)
  VALUES (new.id, new_tenant_id, 'admin');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. REPAIR SCRIPT: Fix existing users who have no tenant (e.g. the user who just signed up)
DO $$ 
DECLARE 
  existing_user RECORD;
  new_tenant_id uuid;
BEGIN
  FOR existing_user IN 
    SELECT id, email FROM auth.users
  LOOP
    -- Only fix if they don't have a profile yet
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = existing_user.id) THEN
        -- Create Tenant
        INSERT INTO public.tenants (name, email)
        VALUES ('Empresa de ' || existing_user.email, existing_user.email)
        RETURNING id INTO new_tenant_id;

        -- Create Profile
        INSERT INTO public.profiles (user_id, tenant_id, role)
        VALUES (existing_user.id, new_tenant_id, 'admin');
    END IF;
  END LOOP;
END $$;
