alter table public.complaints
  drop constraint if exists complaints_status_check;

alter table public.complaints
  add constraint complaints_status_check
  check (status in ('pending', 'assigned', 'in_progress', 'resolved', 'cancelled'));

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'complaints'
      and policyname = 'Allow anon update'
  ) then
    create policy "Allow anon update"
      on public.complaints
      for update
      to anon
      using (true)
      with check (true);
  end if;
end
$$;
