"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/utils/supabase/client";
import { CATEGORIES } from "@/lib/constants";
import { formatPrice, formatSize, isMeasuredUnit } from "@/lib/format";
import type { Product, ProductOverview } from "@/lib/types";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";

export default function HomeClient({
  products: initialProducts,
  userId,
  isAdmin,
}: {
  products: ProductOverview[];
  userId: string | null;
  isAdmin: boolean;
}) {
  const t = useTranslations("home");
  const tCat = useTranslations("categories");
  const tProduct = useTranslations("product");
  const tCommon = useTranslations("common");
  const tUnits = useTranslations("units");
  const locale = useLocale();

  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductOverview | null>(
    null
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, search, category]);

  const usedCategories = useMemo(
    () => CATEGORIES.filter((c) => products.some((p) => p.category === c)),
    [products]
  );

  function handleSaved(updated: Product) {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
    setEditingProduct(null);
  }

  async function handleDelete(id: string) {
    if (!window.confirm(tCommon("confirmDelete"))) return;
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      window.alert(tCommon("error"));
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
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
              + {t("addProduct")}
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              + {t("addProduct")}
            </Link>
          )}
        </div>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={
            category === null
              ? "rounded-full bg-teal-600 px-3 py-1 text-xs font-medium text-white"
              : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200"
          }
        >
          {t("allCategories")}
        </button>
        {usedCategories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(category === c ? null : c)}
            className={
              category === c
                ? "rounded-full bg-teal-600 px-3 py-1 text-xs font-medium text-white"
                : "rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-200"
            }
          >
            {tCat(c)}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">{t("empty")}</p>
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">
          {t("noResults")}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((p) => {
            const size = formatSize(p.size_value, p.size_unit);
            return (
              <li key={p.id} className="group relative">
                <Link
                  href={`/products/${p.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">
                        {p.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {[p.brand, size].filter(Boolean).join(" · ") || " "}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                      {tCat(p.category)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    {p.best_price != null ? (
                      <div>
                        <p className="text-lg font-bold text-teal-700">
                          {formatPrice(p.best_price, locale)}
                          {isMeasuredUnit(p.size_unit) && p.size_value == null && (
                            <span className="text-sm font-normal text-teal-700/70">
                              /{tUnits(p.size_unit)}
                            </span>
                          )}
                          {p.best_price_is_offer && (
                            <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 align-middle text-[11px] font-medium text-amber-600">
                              {tProduct("offer")}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t("bestPriceAt")}{" "}
                          <span className="font-medium text-slate-600">
                            {p.best_supermarket_name}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">{t("noPrices")}</p>
                    )}
                    {p.store_count > 0 && (
                      <span className="text-xs text-slate-400">
                        {t("storeCount", { count: p.store_count })}
                      </span>
                    )}
                  </div>
                </Link>

                {isAdmin && (
                  <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingProduct(p);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm hover:bg-slate-50"
                    >
                      {tCommon("edit")}
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete(p.id);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-red-600 shadow-sm hover:bg-red-50"
                    >
                      {tCommon("delete")}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showAdd && userId && (
        <AddProductModal userId={userId} onClose={() => setShowAdd(false)} />
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
