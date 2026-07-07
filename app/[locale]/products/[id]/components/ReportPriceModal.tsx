"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { isMeasuredUnit } from "@/lib/format";
import type { PriceReport, SizeUnit, Supermarket } from "@/lib/types";

export default function ReportPriceModal({
  productId,
  supermarkets,
  userId,
  sizeValue,
  sizeUnit,
  onClose,
  onReported,
}: {
  productId: string;
  supermarkets: Supermarket[];
  userId: string;
  sizeValue: number | null;
  sizeUnit: SizeUnit | null;
  onClose: () => void;
  onReported: (report: PriceReport) => void;
}) {
  const t = useTranslations("reportPrice");
  const tUnits = useTranslations("units");
  const tCommon = useTranslations("common");
  const priceUnit =
    isMeasuredUnit(sizeUnit) && sizeValue == null
      ? `KYD/${tUnits(sizeUnit)}`
      : "KYD";

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("price_reports")
      .insert({
        product_id: productId,
        supermarket_id: form.get("supermarket_id") as string,
        price: Number(form.get("price")),
        is_offer: form.get("is_offer") === "on",
        note: (form.get("note") as string).trim() || null,
        reported_by: userId,
      })
      .select("*, profiles(display_name)")
      .single();

    if (insertError || !data) {
      setError(tCommon("error"));
      setSaving(false);
      return;
    }

    onReported(data as PriceReport);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-slate-800">{t("title")}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("supermarket")}
            </label>
            <select
              name="supermarket_id"
              required
              defaultValue=""
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
            >
              <option value="" disabled>
                {t("selectSupermarket")}
              </option>
              {supermarkets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.area ? ` (${s.area})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("price", { unit: priceUnit })}
            </label>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              required
              inputMode="decimal"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="is_offer" className="accent-teal-600" />
            {t("isOffer")}
          </label>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("note")}
            </label>
            <input
              name="note"
              placeholder={t("notePlaceholder")}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              {tCommon("cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
