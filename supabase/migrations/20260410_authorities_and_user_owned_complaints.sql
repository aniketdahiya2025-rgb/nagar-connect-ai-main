create table if not exists public.authorities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('department', 'ngo', 'helpline')),
  area text not null,
  contact text not null,
  category text not null,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists authorities_category_idx on public.authorities (category);

alter table public.authorities enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'authorities' and policyname = 'Allow anon read authorities'
  ) then
    create policy "Allow anon read authorities"
      on public.authorities
      for select
      to anon
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'authorities' and policyname = 'Allow anon insert authorities'
  ) then
    create policy "Allow anon insert authorities"
      on public.authorities
      for insert
      to anon
      with check (true);
  end if;
end
$$;

alter table public.complaints add column if not exists user_id text;

create index if not exists complaints_user_id_idx on public.complaints (user_id);
