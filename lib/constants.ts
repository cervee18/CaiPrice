export const CATEGORIES = [
  "produce",
  "meat",
  "fish",
  "dairy",
  "bakery",
  "pantry",
  "drinks",
  "frozen",
  "household",
  "hygiene",
  "other",
] as const;

export const SIZE_UNITS = [
  "kg",
  "g",
  "lb",
  "oz",
  "l",
  "ml",
  "gal",
  "fl_oz",
  "unit",
  "pack",
] as const;

// Units priced "by weight/volume" (e.g. KYD 3.45/lb) as opposed to a fixed
// article price ("unit"/"pack") — these get a "/<unit>" suffix on prices.
export const MEASURED_UNITS = ["kg", "g", "lb", "oz", "l", "ml", "gal", "fl_oz"] as const;
