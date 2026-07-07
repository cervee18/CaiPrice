-- Local dev seed: real Grand Cayman supermarkets.
-- Products and price reports start empty; add them through the app.

insert into public.supermarkets (name, chain, area) values
  ('Foster Airport', 'Foster', 'Airport'),
  ('Foster Camana Bay', 'Foster', 'Camana Bay'),
  ('Foster Republica', 'Foster', 'Republica'),
  ('Foster Countryside', 'Foster', 'Countryside'),
  ('Hurleys', null, ''),
  ('Kirk', null, ''),
  ('PriceRight', null, ''),
  ('CostuLess', null, '');
