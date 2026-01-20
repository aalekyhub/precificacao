-- PrecificaMaster Full Schema
-- Note: 'Contact' table is excluded as it already exists.

-- 1. Company Settings (Configurações da Empresa)
-- Stores single row of global configuration for calculations
create table public."Settings" (
    id uuid not null default gen_random_uuid(),
    pro_labore numeric default 0,
    work_days_per_month integer default 20,
    work_hours_per_day integer default 8,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);

-- 2. Fixed Costs (Custos Fixos)
-- Monthly expenses like Rent, Electricity, Internet
create table public."FixedCost" (
    id uuid not null default gen_random_uuid(),
    name text not null,
    value numeric not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);

-- 3. Materials (Insumos)
-- Raw materials used to adjust products
create table public."Material" (
    id uuid not null default gen_random_uuid(),
    name text not null,
    unit text not null, -- 'un', 'kg', 'l', 'm', 'cm'
    price numeric not null default 0, -- Price per unit
    stock numeric default 0,
    min_stock numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);

-- 4. Products (Produtos)
-- Final products for sale
create table public."Product" (
    id uuid not null default gen_random_uuid(),
    name text not null,
    description text,
    selling_price numeric not null default 0,
    profit_margin numeric default 0, -- Desired margin %
    labor_time integer default 0, -- Time in minutes to produce
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);

-- 5. Product Recipe / BOM (Composição do Produto)
-- Links Products to Materials (Many-to-Many)
create table public."ProductMaterial" (
    id uuid not null default gen_random_uuid(),
    product_id uuid not null references public."Product"(id) on delete cascade,
    material_id uuid not null references public."Material"(id) on delete restrict,
    quantity numeric not null default 1, -- Quantity of material used
    primary key (id)
);

-- 6. Orders / Quotes (Orçamentos)
create table public."Order" (
    id uuid not null default gen_random_uuid(),
    customer_id text references public."Contact"(id), -- Using text ID from Contact table
    status text default 'draft', -- 'draft', 'approved', 'completed'
    total_value numeric default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);

-- 7. Order Items
create table public."OrderItem" (
    id uuid not null default gen_random_uuid(),
    order_id uuid not null references public."Order"(id) on delete cascade,
    product_id uuid references public."Product"(id),
    name text not null, -- Copy name in case product changes
    quantity integer default 1,
    unit_price numeric default 0,
    total_price numeric default 0,
    primary key (id)
);

-- Enable RLS (Row Level Security) for all tables
alter table public."Settings" enable row level security;
alter table public."FixedCost" enable row level security;
alter table public."Material" enable row level security;
alter table public."Product" enable row level security;
alter table public."ProductMaterial" enable row level security;
alter table public."Order" enable row level security;
alter table public."OrderItem" enable row level security;

-- Create policies (Open for all for now, as requested)
create policy "Enable all access for all users" on public."Settings" for all using (true) with check (true);
create policy "Enable all access for all users" on public."FixedCost" for all using (true) with check (true);
create policy "Enable all access for all users" on public."Material" for all using (true) with check (true);
create policy "Enable all access for all users" on public."Product" for all using (true) with check (true);
create policy "Enable all access for all users" on public."ProductMaterial" for all using (true) with check (true);
create policy "Enable all access for all users" on public."Order" for all using (true) with check (true);
create policy "Enable all access for all users" on public."OrderItem" for all using (true) with check (true);
