import { createClient } from "@/utils/supabase/server";
import { getSession } from "@/lib/session";
import type { ProductOverview } from "@/lib/types";
import HomeClient from "./components/HomeClient";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: products }, { userId, isAdmin }] = await Promise.all([
    supabase.from("product_overview").select("*").order("name"),
    getSession(),
  ]);

  return (
    <HomeClient
      products={(products ?? []) as ProductOverview[]}
      userId={userId}
      isAdmin={isAdmin}
    />
  );
}
