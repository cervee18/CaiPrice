-- Editing/deleting is admin-only. Previously any signed-in user could
-- update or delete products/supermarkets they created, and delete price
-- reports they filed, regardless of admin status. Adding/reporting stays
-- open to everyone; only admins may change or remove existing entries.
drop policy "creators can update their products" on public.products;
drop policy "creators can delete their products" on public.products;

drop policy "creators can update their supermarkets" on public.supermarkets;
drop policy "creators can delete their supermarkets" on public.supermarkets;

drop policy "reporters can delete their reports" on public.price_reports;
