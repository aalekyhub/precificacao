-- Create Contact table
create table public."Contact" (
    id uuid not null default gen_random_uuid(),
    name text not null,
    type text not null check (type in ('Cliente', 'Fornecedor')),
    phone text,
    email text,
    address text,
    observations text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public."Contact" enable row level security;

-- Create policy to allow all operations for now (can be restricted later)
create policy "Enable all access for all users"
on public."Contact"
for all
using (true)
with check (true);
