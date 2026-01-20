-- Drop table if it exists to allow reconstruction with new schema
drop table if exists public."Contact";

-- Create Contact table with Text ID
create table public."Contact" (
    id text not null, -- Changed from uuid to text to support custom IDs like '1234'
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

-- Create policy to allow all operations
create policy "Enable all access for all users"
on public."Contact"
for all
using (true)
with check (true);
