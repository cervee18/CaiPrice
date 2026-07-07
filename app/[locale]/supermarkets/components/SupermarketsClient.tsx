"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Supermarket, SupermarketOverview } from "@/lib/types";
import AddSupermarketModal from "./AddSupermarketModal";
import EditSupermarketModal from "./EditSupermarketModal";

export default function SupermarketsClient({
  initialSupermarkets,
  userId,
  isAdmin,
}: {
  initialSupermarkets: SupermarketOverview[];
  userId: string | null;
  isAdmin: boolean;
}) {
  const t = useTranslations("supermarkets");
  const tCommon = useTranslations("common");

  const [supermarkets, setSupermarkets] = useState(initialSupermarkets);
  const [showAdd, setShowAdd] = useState(false);
  const [editingMarket, setEditingMarket] =
    useState<SupermarketOverview | null>(null);

  function handleAdded(market: SupermarketOverview) {
    setSupermarkets((prev) =>
      [...prev, market].sort((a, b) => a.name.localeCompare(b.name))
    );
    setShowAdd(false);
  }

  function handleSaved(updated: Supermarket) {
    setSupermarkets((prev) =>
      prev
        .map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditingMarket(null);
  }

  async function handleDelete(id: string) {
    if (!window.confirm(tCommon("confirmDelete"))) return;
    const supabase = createClient();
    const { error } = await supabase.from("supermarkets").delete().eq("id", id);
    if (error) {
      window.alert(tCommon("error"));
      return;
    }
    setSupermarkets((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-slate-800">{t("title")}</h1>
        <div className="ml-auto">
          {userId ? (
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              + {t("addSupermarket")}
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              + {t("addSupermarket")}
            </Link>
          )}
        </div>
      </div>

      {supermarkets.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">{t("empty")}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {supermarkets.map((s) => (
            <li
              key={s.id}
              className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-800">{s.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {[s.chain, s.area].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
                  {t("pricesCount", { count: s.prices_count })}
                </span>
                {s.best_count > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">
                    {t("bestCount", { count: s.best_count })}
                  </span>
                )}
              </div>

              {isAdmin && (
                <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
                  <button
                    onClick={() => setEditingMarket(s)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm hover:bg-slate-50"
                  >
                    {tCommon("edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-red-600 shadow-sm hover:bg-red-50"
                  >
                    {tCommon("delete")}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {showAdd && userId && (
        <AddSupermarketModal
          userId={userId}
          onClose={() => setShowAdd(false)}
          onAdded={handleAdded}
        />
      )}

      {editingMarket && (
        <EditSupermarketModal
          supermarket={editingMarket}
          onClose={() => setEditingMarket(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
