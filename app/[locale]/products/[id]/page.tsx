import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getSession } from "@/lib/session";
import type {
  PriceReport,
  Product,
  Supermarket,
} from "@/lib/types";
import ProductDetailClient from "./components/ProductDetailClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [productRes, currentRes, historyRes, supermarketsRes, session] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).single(),
      supabase
        .from("current_prices")
        .select("*, profiles(display_name)")
        .eq("product_id", id),
      supabase
        .from("price_reports")
        .select("*, profiles(display_name)")
        .eq("product_id", id)
        .order("reported_at", { ascending: false })
        .limit(30),
      supabase.from("supermarkets").select("*").order("name"),
      getSession(),
    ]);

  if (!productRes.data) notFound();

  return (
    <ProductDetailClient
      product={productRes.data as Product}
      initialCurrentPrices={(currentRes.data ?? []) as PriceReport[]}
      initialHistory={(historyRes.data ?? []) as PriceReport[]}
      supermarkets={(supermarketsRes.data ?? []) as Supermarket[]}
      userId={session.userId}
      isAdmin={session.isAdmin}
    />
  );
}
