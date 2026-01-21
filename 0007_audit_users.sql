-- AUDIT SCRIPT: Check User Isolation
-- This script lists every user and their assigned Company (Tenant).
-- IF multiple users show the SAME "tenant_id", then they are sharing data (Bug).
-- IF every user has a DIFFERENT "tenant_id", then isolation is working correctly.

SELECT 
    u.email as "Usuario (Email)",
    t.name as "Empresa (Tenant)",
    p.tenant_id as "ID da Empresa"
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
JOIN public.tenants t ON p.tenant_id = t.id
ORDER BY u.email;
