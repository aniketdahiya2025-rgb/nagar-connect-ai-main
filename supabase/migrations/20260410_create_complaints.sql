create extension if not exists pgcrypto;

create table if not exists public.complaints (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  urgency text not null check (urgency in ('high', 'medium', 'low')),
  status text not null default 'pending' check (status in ('pending', 'assigned', 'in_progress', 'resolved')),
  location text not null,
  ward text not null,
  lat double precision not null default 0,
  lng double precision not null default 0,
  reported_by text not null default 'Citizen',
  assigned_to text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists complaints_created_at_idx on public.complaints (created_at desc);
create index if not exists complaints_category_idx on public.complaints (category);
create index if not exists complaints_status_idx on public.complaints (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists complaints_set_updated_at on public.complaints;
create trigger complaints_set_updated_at
before update on public.complaints
for each row execute function public.set_updated_at();

alter table public.complaints enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'complaints'
      and policyname = 'Allow anon read'
  ) then
    create policy "Allow anon read"
    on public.complaints
    for select
    to anon
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'complaints'
      and policyname = 'Allow anon insert'
  ) then
    create policy "Allow anon insert"
    on public.complaints
    for insert
    to anon
    with check (true);
  end if;
end
$$;
