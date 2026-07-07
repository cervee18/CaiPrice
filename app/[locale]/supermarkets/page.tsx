import { createClient } from "@/utils/supabase/server";
import { getSession } from "@/lib/session";
import type { SupermarketOverview } from "@/lib/types";
import SupermarketsClient from "./components/SupermarketsClient";

export default async function SupermarketsPage() {
  const supabase = await createClient();

  const [{ data: supermarkets }, { userId, isAdmin }] = await Promise.all([
    supabase.from("supermarket_overview").select("*").order("name"),
    getSession(),
  ]);

  return (
    <SupermarketsClient
      initialSupermarkets={(supermarkets ?? []) as SupermarketOverview[]}
      userId={userId}
      isAdmin={isAdmin}
    />
  );
}
