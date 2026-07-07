export type SizeUnit =
  | "kg"
  | "g"
  | "lb"
  | "oz"
  | "l"
  | "ml"
  | "gal"
  | "fl_oz"
  | "unit"
  | "pack";

export interface Supermarket {
  id: string;
  name: string;
  chain: string | null;
  area: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  size_value: number | null;
  size_unit: SizeUnit | null;
  barcode: string | null;
  photo_path: string | null;
  created_at: string;
}

export interface PriceReport {
  id: string;
  product_id: string;
  supermarket_id: string;
  price: number;
  is_offer: boolean;
  note: string | null;
  reported_by: string | null;
  reported_at: string;
  profiles: { display_name: string } | null;
}

export interface Profile {
  id: string;
  display_name: string;
  is_admin: boolean;
}

export interface ProductOverview extends Product {
  best_price: number | null;
  best_price_is_offer: boolean | null;
  best_price_at: string | null;
  best_supermarket_id: string | null;
  best_supermarket_name: string | null;
  store_count: number;
}

export interface SupermarketOverview extends Supermarket {
  prices_count: number;
  best_count: number;
}
