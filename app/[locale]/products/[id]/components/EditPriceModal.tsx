"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { isMeasuredUnit } from "@/lib/format";
import type { PriceReport, SizeUnit } from "@/lib/types";

export default function EditPriceModal({
  report,
  sizeValue,
  sizeUnit,
  onClose,
  onSaved,
}: {
  report: PriceReport;
  sizeValue: number | null;
  sizeUnit: SizeUnit | null;
  onClose: () => void;
  onSaved: (report: PriceReport) => void;
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
    const { data, error: updateError } = await supabase
      .from("price_reports")
      .update({
        price: Number(form.get("price")),
        is_offer: form.get("is_offer") === "on",
        note: (form.get("note") as string).trim() || null,
      })
      .eq("id", report.id)
      .select("*, profiles(display_name)")
      .single();

    if (updateError || !data) {
      setError(tCommon("error"));
      setSaving(false);
      return;
    }

    onSaved(data as PriceReport);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          {t("editTitle")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
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
              defaultValue={report.price}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              name="is_offer"
              defaultChecked={report.is_offer}
              className="accent-teal-600"
            />
            {t("isOffer")}
          </label>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("note")}
            </label>
            <input
              name="note"
              defaultValue={report.note ?? ""}
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
              {t("saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
