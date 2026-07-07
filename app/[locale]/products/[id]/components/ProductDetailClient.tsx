"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  formatDate,
  formatPrice,
  formatSize,
  isMeasuredUnit,
  productPhotoUrl,
  unitPrice,
} from "@/lib/format";
import type { PriceReport, Product, Supermarket } from "@/lib/types";
import ReportPriceModal from "./ReportPriceModal";
import EditPriceModal from "./EditPriceModal";
import MergeProductModal from "./MergeProductModal";
import CameraIcon from "../../../components/CameraIcon";
import EditProductModal from "../../../components/EditProductModal";

export default function ProductDetailClient({
  product: initialProduct,
  initialCurrentPrices,
  initialHistory,
  supermarkets,
  userId,
  isAdmin,
}: {
  product: Product;
  initialCurrentPrices: PriceReport[];
  initialHistory: PriceReport[];
  supermarkets: Supermarket[];
  userId: string | null;
  isAdmin: boolean;
}) {
  const t = useTranslations("product");
  const tCat = useTranslations("categories");
  const tCommon = useTranslations("common");
  const tUnits = useTranslations("units");
  const locale = useLocale();
  const router = useRouter();

  const [product, setProduct] = useState(initialProduct);
  const [currentPrices, setCurrentPrices] = useState(initialCurrentPrices);
  const [history, setHistory] = useState(initialHistory);
  const [showReport, setShowReport] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showMerge, setShowMerge] = useState(false);
  const [editingReport, setEditingReport] = useState<PriceReport | null>(null);

  const supermarketById = useMemo(
    () => new Map(supermarkets.map((s) => [s.id, s])),
    [supermarkets]
  );

  const sortedCurrent = useMemo(
    () => [...currentPrices].sort((a, b) => a.price - b.price),
    [currentPrices]
  );

  function handleReported(report: PriceReport) {
    setHistory((prev) => [report, ...prev]);
    setCurrentPrices((prev) => [
      report,
      ...prev.filter((p) => p.supermarket_id !== report.supermarket_id),
    ]);
    setShowReport(false);
  }

  function handleProductSaved(updated: Product) {
    setProduct(updated);
    setShowEditProduct(false);
  }

  async function handleDeleteProduct() {
    if (!window.confirm(tCommon("confirmDelete"))) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);
    if (error) {
      window.alert(tCommon("error"));
      return;
    }
    router.push("/");
  }

  function handleReportSaved(updated: PriceReport) {
    setHistory((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setCurrentPrices((prev) =>
      prev.map((cp) => (cp.id === updated.id ? updated : cp))
    );
    setEditingReport(null);
  }

  async function handleDeleteReport(id: string) {
    if (!window.confirm(tCommon("confirmDelete"))) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("price_reports")
      .delete()
      .eq("id", id);
    if (error) {
      window.alert(tCommon("error"));
      return;
    }
    setHistory((prev) => prev.filter((r) => r.id !== id));
    setCurrentPrices((prev) => prev.filter((cp) => cp.id !== id));
  }

  const size = formatSize(product.size_value, product.size_unit);
  const hasFixedSize = product.size_value != null;
  const measuredNoSize = isMeasuredUnit(product.size_unit) && !hasFixedSize;
  const priceSuffix = measuredNoSize ? `/${tUnits(product.size_unit!)}` : "";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-teal-700 hover:underline">
          ← {t("back")}
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {productPhotoUrl(product.photo_path) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={productPhotoUrl(product.photo_path)!}
                alt=""
                className="h-20 w-20 shrink-0 rounded-lg border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-300">
                <CameraIcon className="h-8 w-8" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {product.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {[product.brand, size, tCat(product.category)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => setShowMerge(true)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  {t("merge")}
                </button>
                <button
                  onClick={() => setShowEditProduct(true)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  {tCommon("edit")}
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  {tCommon("delete")}
                </button>
              </>
            )}
            {userId ? (
              <button
                onClick={() => setShowReport(true)}
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                + {t("reportPrice")}
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                + {t("reportPrice")}
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
          {t("pricesTitle")}
        </h2>
        {sortedCurrent.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-slate-500">
            {t("noPricesYet")}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="px-4 py-2 font-medium">{t("supermarket")}</th>
                <th className="px-4 py-2 text-right font-medium">
                  {t("price")}
                </th>
                {hasFixedSize && (
                  <th className="hidden px-4 py-2 text-right font-medium sm:table-cell">
                    {t("unitPrice")}
                  </th>
                )}
                <th className="hidden px-4 py-2 text-right font-medium sm:table-cell">
                  {t("updated")}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedCurrent.map((cp, i) => {
                const market = supermarketById.get(cp.supermarket_id);
                const up = unitPrice(
                  cp.price,
                  product.size_value,
                  product.size_unit
                );
                return (
                  <tr key={cp.supermarket_id} className="border-t border-slate-100">
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-slate-700">
                        {market?.name ?? "—"}
                      </span>
                      {market?.area && (
                        <span className="ml-1.5 text-xs text-slate-400">
                          {market.area}
                        </span>
                      )}
                      {i === 0 && (
                        <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                          {t("best")}
                        </span>
                      )}
                      {cp.is_offer && (
                        <span className="ml-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                          {t("offer")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-slate-800">
                      {formatPrice(cp.price, locale)}
                      {priceSuffix && (
                        <span className="font-normal text-slate-400">
                          {priceSuffix}
                        </span>
                      )}
                    </td>
                    {hasFixedSize && (
                      <td className="hidden px-4 py-2.5 text-right text-slate-500 sm:table-cell">
                        {up
                          ? `${formatPrice(up.amount, locale)}/${up.per}`
                          : "—"}
                      </td>
                    )}
                    <td className="hidden px-4 py-2.5 text-right text-xs text-slate-400 sm:table-cell">
                      {formatDate(cp.reported_at, locale)}
                      {cp.profiles && (
                        <p>{t("reportedBy", { name: cp.profiles.display_name })}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {history.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
            {t("historyTitle")}
          </h2>
          <ul>
            {history.map((r) => (
              <li
                key={r.id}
                className="group flex items-center gap-3 border-t border-slate-100 px-4 py-2 text-sm first:border-t-0"
              >
                <span className="w-24 shrink-0 text-xs text-slate-400">
                  {formatDate(r.reported_at, locale)}
                </span>
                <span className="min-w-0 flex-1 truncate text-slate-600">
                  {supermarketById.get(r.supermarket_id)?.name ?? "—"}
                  {r.profiles && (
                    <span className="ml-2 text-xs text-slate-400">
                      {t("reportedBy", { name: r.profiles.display_name })}
                    </span>
                  )}
                  {r.note && (
                    <span className="ml-2 text-xs text-slate-400">
                      {r.note}
                    </span>
                  )}
                </span>
                {r.is_offer && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                    {t("offer")}
                  </span>
                )}
                <span className="font-medium text-slate-700">
                  {formatPrice(r.price, locale)}
                  {priceSuffix && (
                    <span className="font-normal text-slate-400">
                      {priceSuffix}
                    </span>
                  )}
                </span>
                {isAdmin && (
                  <div className="hidden shrink-0 gap-1 group-hover:flex">
                    <button
                      onClick={() => setEditingReport(r)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm hover:bg-slate-50"
                    >
                      {tCommon("edit")}
                    </button>
                    <button
                      onClick={() => handleDeleteReport(r.id)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-red-600 shadow-sm hover:bg-red-50"
                    >
                      {tCommon("delete")}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {showReport && userId && (
        <ReportPriceModal
          productId={product.id}
          supermarkets={supermarkets}
          userId={userId}
          sizeValue={product.size_value}
          sizeUnit={product.size_unit}
          onClose={() => setShowReport(false)}
          onReported={handleReported}
        />
      )}

      {showEditProduct && (
        <EditProductModal
          product={product}
          onClose={() => setShowEditProduct(false)}
          onSaved={handleProductSaved}
        />
      )}

      {editingReport && (
        <EditPriceModal
          report={editingReport}
          sizeValue={product.size_value}
          sizeUnit={product.size_unit}
          onClose={() => setEditingReport(null)}
          onSaved={handleReportSaved}
        />
      )}

      {showMerge && (
        <MergeProductModal
          product={product}
          onClose={() => setShowMerge(false)}
          onMerged={() => window.location.reload()}
        />
      )}
    </div>
  );
}
