# CaiPrice

Los mejores precios de tu isla, entre todos. / Your island's best prices, crowdsourced.

A community price tracker for local supermarkets: anyone can add products and supermarkets, report the prices they see, and check where each product is currently cheapest.

## Features

- 🛒 Product list with best current price and where to find it
- 🏪 Supermarket directory with "cheapest for N products" stats
- 📈 Full price history per product and supermarket, with offer flags
- ⚖️ Normalized unit prices (KYD/kg, KYD/l) for fair comparison across pack sizes
- 🌍 Spanish + English UI (`/es`, `/en`)
- 👥 Crowdsourced: all price reports are shared; sign in to contribute, browse without an account

## Stack

Next.js 16 (App Router) · Tailwind CSS v4 · Supabase (Postgres, Auth, RLS) · next-intl

## Getting started

```bash
npm install
supabase start   # local Supabase on ports 55321-55329
npm run dev      # http://localhost:3000
```

`.env.local` is preconfigured for the local Supabase instance. For a hosted project, copy `.env.example` and fill in your project's URL and anon key.

Seed data (a few supermarkets, products, and prices) lives in `supabase/seed.sql`.
