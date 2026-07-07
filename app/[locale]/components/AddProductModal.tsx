"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/utils/supabase/client";
import { CATEGORIES, SIZE_UNITS } from "@/lib/constants";
import { formatSize } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function AddProductModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const t = useTranslations("addProduct");
  const tCat = useTranslations("categories");
  const tUnits = useTranslations("units");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [name, setName] = useState("");
  const [matches, setMatches] = useState<Product[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = name.trim().replace(/[,()]/g, "");
    if (q.length < 2) {
      setMatches([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
        .limit(5);
      setMatches((data ?? []) as Product[]);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [name]);

  function goToExisting(product: Product) {
    onClose();
    router.push(`/products/${product.id}`);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const sizeValue = form.get("size_value") as string;

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("products")
      .insert({
        name: (form.get("name") as string).trim(),
        brand: (form.get("brand") as string).trim() || null,
        category: form.get("category") as string,
        size_value: sizeValue ? Number(sizeValue) : null,
        size_unit: form.get("size_unit") as string,
        created_by: userId,
      })
      .select()
      .single();

    if (insertError || !data) {
      setError(tCommon("error"));
      setSaving(false);
      return;
    }

    router.push(`/products/${data.id}`);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-slate-800">{t("title")}</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("name")}
            </label>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              autoComplete="off"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          {matches.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5">
              <p className="mb-1.5 text-xs text-amber-800">
                {t("duplicateHint")}
              </p>
              <ul className="space-y-1">
                {matches.map((m) => {
                  const size = formatSize(m.size_value, m.size_unit);
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => goToExisting(m)}
                        className="block w-full rounded-md bg-white px-2.5 py-1.5 text-left text-sm shadow-sm hover:bg-slate-50"
                      >
                        <span className="font-medium text-slate-700">
                          {m.name}
                        </span>
                        {(m.brand || size) && (
                          <span className="ml-1.5 text-xs text-slate-400">
                            {[m.brand, size].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("brand")}
            </label>
            <input
              name="brand"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("category")}
            </label>
            <select
              name="category"
              defaultValue="other"
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
                defaultValue="unit"
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
              {t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
