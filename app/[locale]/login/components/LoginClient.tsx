"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginClient() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setInfo(null);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    const supabase = createClient();

    if (mode === "signin") {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: (form.get("display_name") as string).trim() },
        },
      });
      if (authError) {
        setError(authError.message);
        setSaving(false);
        return;
      }
      if (!data.session) {
        // Email confirmation is enabled: no session until the user confirms.
        setInfo(t("checkEmail"));
        setSaving(false);
        return;
      }
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm pt-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-lg font-bold text-slate-800">
          {mode === "signin" ? t("signInTitle") : t("signUpTitle")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3" key={mode}>
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                {t("displayName")}
              </label>
              <input
                name="display_name"
                required
                placeholder={t("displayNamePlaceholder")}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("email")}
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              {t("password")}
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-emerald-600">{info}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {saving
              ? tCommon("loading")
              : mode === "signin"
                ? t("signIn")
                : t("signUp")}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
          className="mt-4 w-full text-center text-sm text-teal-700 hover:underline"
        >
          {mode === "signin" ? t("noAccount") : t("haveAccount")}
        </button>
      </div>
    </div>
  );
}
