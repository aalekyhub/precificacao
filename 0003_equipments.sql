-- MIGRATION: 0003_Equipments
-- description: Adds Equipments table for tracking investments and depreciation.

CREATE TABLE IF NOT EXISTS public."Equipments" (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL DEFAULT public.current_tenant_id(), -- Auto-assign current tenant
    name text NOT NULL,
    value numeric NOT NULL DEFAULT 0, -- Purchase Price
    lifespan_years integer NOT NULL DEFAULT 5, -- Useful life in years
    date date DEFAULT current_date,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- Enable RLS
ALTER TABLE public."Equipments" ENABLE ROW LEVEL SECURITY;

-- Create Policies (Strict Multi-tenancy)
CREATE POLICY "Tenant Isolation Select" ON public."Equipments"
    FOR SELECT USING (tenant_id = public.current_tenant_id());

CREATE POLICY "Tenant Isolation Insert" ON public."Equipments"
    FOR INSERT WITH CHECK (tenant_id = public.current_tenant_id());

CREATE POLICY "Tenant Isolation Update" ON public."Equipments"
    FOR UPDATE USING (tenant_id = public.current_tenant_id());

CREATE POLICY "Tenant Isolation Delete" ON public."Equipments"
    FOR DELETE USING (tenant_id = public.current_tenant_id());

-- Grant access
GRANT ALL ON public."Equipments" TO service_role;
GRANT ALL ON public."Equipments" TO authenticated;
GRANT ALL ON public."Equipments" TO anon; 
