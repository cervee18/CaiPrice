import { MEASURED_UNITS } from "./constants";
import type { SizeUnit } from "./types";

/** True for units priced by weight/volume (kg, lb, l, gal…) rather than a fixed article price. */
export function isMeasuredUnit(unit: SizeUnit | null): unit is (typeof MEASURED_UNITS)[number] {
  return unit != null && (MEASURED_UNITS as readonly string[]).includes(unit);
}

export function formatPrice(price: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "KYD",
  }).format(price);
}

export function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatSize(value: number | null, unit: SizeUnit | null) {
  if (unit == null) return null;
  if (value == null) return null;
  if (unit === "unit") return `x${value}`;
  if (unit === "pack") return `${value} pack`;
  return `${value} ${unit}`;
}

// Conversion factors into a common base so different-sized packages are
// comparable: weight units into kg, volume units into l.
const KG_PER_UNIT: Partial<Record<SizeUnit, number>> = {
  kg: 1,
  g: 0.001,
  lb: 0.45359237,
  oz: 0.028349523125,
};

const L_PER_UNIT: Partial<Record<SizeUnit, number>> = {
  l: 1,
  ml: 0.001,
  gal: 3.785411784,
  fl_oz: 0.0295735295625,
};

/**
 * Normalized price per base unit (KYD/kg, KYD/l) so different pack
 * sizes and units (metric or imperial) are comparable. Returns null
 * when size info is missing.
 */
export function unitPrice(
  price: number,
  value: number | null,
  unit: SizeUnit | null
): { amount: number; per: string } | null {
  if (value == null || unit == null || value <= 0) return null;

  if (unit in KG_PER_UNIT) {
    return { amount: price / (value * KG_PER_UNIT[unit]!), per: "kg" };
  }
  if (unit in L_PER_UNIT) {
    return { amount: price / (value * L_PER_UNIT[unit]!), per: "l" };
  }
  return { amount: price / value, per: "ud" };
}
