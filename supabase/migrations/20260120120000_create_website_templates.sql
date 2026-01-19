-- Create website_templates table to store HTML templates
create table public.website_templates (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  description text null,
  html_content text not null,
  thumbnail_url text null,
  is_active boolean not null default true,
  constraint website_templates_pkey primary key (id)
);

-- Add index on active status
create index idx_website_templates_is_active on public.website_templates (is_active);

-- Enable RLS
alter table public.website_templates enable row level security;

-- Policies
create policy "Enable read access for all users" on public.website_templates
  for select using (true);

create policy "Enable insert access for authenticated users" on public.website_templates
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update access for authenticated users" on public.website_templates
  for update using (auth.role() = 'authenticated');

create policy "Enable delete access for authenticated users" on public.website_templates
  for delete using (auth.role() = 'authenticated');
