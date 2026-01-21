-- DEBUG SCRIPT: Inspect Tenants and Settings
-- description: Lists all users, their assigned tenants, and the current settings records to verify isolation.

-- 1. Check Profiles (User -> Tenant Mapping)
SELECT 
    p.user_id,
    u.email,
    p.tenant_id,
    t.name as tenant_name
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
JOIN public.tenants t ON p.tenant_id = t.id;

-- 2. Check Settings Records
SELECT 
    s.id,
    s.pro_labore,
    s.tenant_id
FROM public."Settings" s;

-- 3. Check for any Settings without Tenant ID (Orphans)
SELECT count(*) as orphan_settings_count FROM public."Settings" WHERE tenant_id IS NULL;
