-- Lets an admin fold a duplicate product into another: all of its price
-- reports move to the target product, then the duplicate is deleted.
create function public.merge_products(source_id uuid, target_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'only admins can merge products';
  end if;

  if source_id = target_id then
    raise exception 'cannot merge a product into itself';
  end if;

  update public.price_reports
     set product_id = target_id
   where product_id = source_id;

  delete from public.products where id = source_id;
end;
$$;

grant execute on function public.merge_products(uuid, uuid) to authenticated;
