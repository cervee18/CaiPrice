-- Add imperial weight/volume units alongside the existing metric ones.
alter table public.products drop constraint products_size_unit_check;

alter table public.products add constraint products_size_unit_check
  check (size_unit = any (array[
    'kg', 'g', 'lb', 'oz',
    'l', 'ml', 'gal', 'fl_oz',
    'unit', 'pack'
  ]));
