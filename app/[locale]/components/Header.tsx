"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Header({ userEmail }: { userEmail: string | null }) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  function switchLocale(nextLocale: "es" | "en") {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-teal-700">
          CaiPrice
        </Link>

        <nav className="flex items-center gap-3 text-sm text-slate-600">
          <Link href="/" className="hover:text-teal-700">
            {t("products")}
          </Link>
          <Link href="/supermarkets" className="hover:text-teal-700">
            {t("supermarkets")}
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-medium">
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={
                  l === locale
                    ? "bg-teal-600 px-2 py-1 text-white"
                    : "bg-white px-2 py-1 text-slate-500 hover:bg-slate-50"
                }
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {userEmail ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="hidden text-slate-500 sm:inline">
                {userEmail}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-slate-200 px-3 py-1 text-slate-600 hover:bg-slate-50"
              >
                {t("signOut")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-teal-600 px-3 py-1 text-sm font-medium text-white hover:bg-teal-700"
            >
              {t("signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
