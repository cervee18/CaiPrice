-- Admin role: can edit/delete any product, supermarket, or price report,
-- bypassing the "only the creator/reporter" restriction.

alter table public.profiles
  add column is_admin boolean not null default false;

create function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Prevent users from granting themselves admin through the normal
-- "users can update own profile" policy. Flip is_admin manually via SQL
-- with this trigger disabled (mirrors DiveFlow's escalation-guard pattern).
create function public.prevent_admin_self_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin then
    raise exception 'is_admin cannot be changed through the app';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_admin_escalation
  before update on public.profiles
  for each row execute function public.prevent_admin_self_escalation();

-- Products
create policy "admins can update any product"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins can delete any product"
  on public.products for delete
  to authenticated
  using (public.is_admin());

-- Supermarkets
create policy "admins can update any supermarket"
  on public.supermarkets for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins can delete any supermarket"
  on public.supermarkets for delete
  to authenticated
  using (public.is_admin());

-- Price reports (no update policy existed before; admins can also delete any)
create policy "admins can update any price report"
  on public.price_reports for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins can delete any price report"
  on public.price_reports for delete
  to authenticated
  using (public.is_admin());
