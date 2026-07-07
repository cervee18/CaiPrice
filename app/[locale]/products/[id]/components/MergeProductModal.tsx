"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/utils/supabase/client";
import { formatSize } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function MergeProductModal({
  product,
  onClose,
  onMerged,
}: {
  product: Product;
  onClose: () => void;
  onMerged: () => void;
}) {
  const t = useTranslations("mergeProduct");
  const tCommon = useTranslations("common");

  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim().replace(/[,()]/g, "");
    if (q.length < 2) {
      setMatches([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .neq("id", product.id)
        .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
        .limit(5);
      setMatches((data ?? []) as Product[]);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, product.id]);

  async function handleConfirm() {
    if (!selected) return;
    setMerging(true);
    setError(null);

    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("merge_products", {
      source_id: selected.id,
      target_id: product.id,
    });

    if (rpcError) {
      setError(tCommon("error"));
      setMerging(false);
      return;
    }

    onMerged();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
        <h2 className="mb-2 text-lg font-bold text-slate-800">{t("title")}</h2>
        <p className="mb-4 text-sm text-slate-500">
          {t("description", { name: product.name })}
        </p>

        {selected ? (
          <div className="space-y-3">
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              {t("confirm", { source: selected.name, target: product.name })}
            </p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                {tCommon("cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={merging}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {t("submit")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              autoFocus
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />

            {query.trim().length >= 2 && (
              <ul className="max-h-64 space-y-1 overflow-y-auto">
                {matches.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">
                    {t("noResults")}
                  </p>
                ) : (
                  matches.map((m) => {
                    const size = formatSize(m.size_value, m.size_unit);
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(m)}
                          className="block w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-left text-sm hover:bg-slate-50"
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
                  })
                )}
              </ul>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                {tCommon("cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
