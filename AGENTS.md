<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CaiPrice

Community-sourced supermarket price tracker: users report product prices at local supermarkets so everyone can see where each product is cheapest.

## Stack

- **Next.js 16 App Router** — server components by default, `"use client"` only when needed
- **Tailwind CSS v4** — `@import "tailwindcss"`, no config file
- **Supabase** — Postgres + Auth + RLS. `@/utils/supabase/server` in server components, `@/utils/supabase/client` in client components
- **next-intl v4** — locale-prefixed routes (`/es`, `/en`), default `es`. Messages in `messages/{es,en}.json`. Use `Link`/`useRouter`/`usePathname` from `@/i18n/navigation`, never from `next/*`

## Conventions

- Every page is split: server `page.tsx` fetches data, passes props to a `*Client.tsx` in a co-located `components/` folder
- Create/edit via centered modals, not separate routes
- After mutations update local React state (no full reloads); exception: creating a product navigates to its detail page
- Light mode only. Background `bg-slate-50`, cards `bg-white rounded-xl shadow-sm border border-slate-200`, primary actions teal (`bg-teal-600`)
- All user-facing strings go through next-intl (`useTranslations`); add keys to **both** `messages/es.json` and `messages/en.json`

## Data model (see `supabase/migrations/`)

- `profiles` — auto-created on signup via trigger
- `supermarkets`, `products` — created by any authenticated user, readable by everyone (incl. anon)
- `price_reports` — append-only crowdsourced price observations
- Views: `current_prices` (latest per product×supermarket), `best_prices` (cheapest current per product), `product_overview`, `supermarket_overview` — all `security_invoker`
- Prefer Postgres (views/functions) over JS for aggregations

## Local dev

- `supabase start` from repo root (ports shifted to **55321–55329** so DiveFlow's stack on 54xxx can run simultaneously)
- `npm run dev` — app expects local Supabase per `.env.local`
- Seed data in `supabase/seed.sql` (applied on `supabase db reset`)
- **Never** run destructive DB commands (`supabase db reset`) or push to a remote DB without explicit user confirmation
