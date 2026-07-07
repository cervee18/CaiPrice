"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { CATEGORIES, SIZE_UNITS } from "@/lib/constants";
import type { Product } from "@/lib/types";

export default function EditProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: (product: Product) => void;
}) {
  const t = useTranslations("addProduct");
  const tCat = useTranslations("categories");
  const tUnits = useTranslations("units");
  const tCommon = useTranslations("common");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const sizeValue = form.get("size_value") as string;

    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from("products")
      .update({
        name: (form.get("name") as string).trim(),
        brand: (form.get("brand") as string).trim() || null,
        category: form.get("category") as string,
        size_value: sizeValue ? Number(sizeValue) : null,
        size_unit: form.get("size_unit") as string,
      })
      .eq("id", product.id)
      .select()
      .single();

    if (updateError || !data) {
      setError(tCommon("error"));
      setSaving(false);
      return;
    }

    onSaved(data as Product);
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
              {t("name")}
            </label>
            <input
              name="name"
              required
              defaultValue={product.name}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("brand")}
            </label>
            <input
              name="brand"
              defaultValue={product.brand ?? ""}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("category")}
            </label>
            <select
              name="category"
              defaultValue={product.category}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {tCat(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                {t("size")}
              </label>
              <input
                name="size_value"
                type="number"
                step="any"
                min="0"
                defaultValue={product.size_value ?? ""}
                placeholder={t("sizePlaceholder")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                {t("unit")}
              </label>
              <select
                name="size_unit"
                defaultValue={product.size_unit ?? "unit"}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
              >
                {SIZE_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {tUnits(u)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-400">{t("sizeHint")}</p>

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
