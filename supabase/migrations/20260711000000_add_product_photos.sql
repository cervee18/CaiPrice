-- Product photos: one compressed image per product, stored in a public bucket.
alter table public.products add column photo_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-photos', 'product-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Uploading a new photo is open to everyone (mirrors "adding a product" being open).
create policy "authenticated users can upload product photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-photos');

-- Replacing/removing an existing photo is admin-only (mirrors product edit/delete).
create policy "admins can replace product photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-photos' and public.is_admin())
  with check (bucket_id = 'product-photos' and public.is_admin());

create policy "admins can delete product photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-photos' and public.is_admin());

-- Surface photo_path on the product list view (must append at the end).
create or replace view public.product_overview
with (security_invoker = on) as
select
  p.id,
  p.name,
  p.brand,
  p.category,
  p.size_value,
  p.size_unit,
  p.barcode,
  p.created_at,
  bp.price as best_price,
  bp.is_offer as best_price_is_offer,
  bp.reported_at as best_price_at,
  s.id as best_supermarket_id,
  s.name as best_supermarket_name,
  (select count(distinct cp.supermarket_id)
     from public.current_prices cp
    where cp.product_id = p.id) as store_count,
  p.photo_path
from public.products p
left join public.best_prices bp on bp.product_id = p.id
left join public.supermarkets s on s.id = bp.supermarket_id;
