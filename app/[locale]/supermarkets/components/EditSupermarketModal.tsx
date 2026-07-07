"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import type { Supermarket } from "@/lib/types";

export default function EditSupermarketModal({
  supermarket,
  onClose,
  onSaved,
}: {
  supermarket: Supermarket;
  onClose: () => void;
  onSaved: (market: Supermarket) => void;
}) {
  const t = useTranslations("supermarkets");
  const tCommon = useTranslations("common");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data, error: updateError } = await supabase
      .from("supermarkets")
      .update({
        name: (form.get("name") as string).trim(),
        chain: (form.get("chain") as string).trim() || null,
        area: (form.get("area") as string).trim(),
      })
      .eq("id", supermarket.id)
      .select()
      .single();

    if (updateError || !data) {
      setError(tCommon("error"));
      setSaving(false);
      return;
    }

    onSaved(data as Supermarket);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-slate-800">
          {t("editSupermarket")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("name")}
            </label>
            <input
              name="name"
              required
              defaultValue={supermarket.name}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("chain")}
            </label>
            <input
              name="chain"
              defaultValue={supermarket.chain ?? ""}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("area")}
            </label>
            <input
              name="area"
              defaultValue={supermarket.area}
              placeholder={t("areaPlaceholder")}
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
