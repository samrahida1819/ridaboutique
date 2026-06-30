# Rida Boutique

Premium boutique ecommerce website built with Next.js App Router, Tailwind CSS, Supabase, and Vercel-ready deployment.

## Stack

- Next.js App Router
- React 19
- Tailwind CSS
- Supabase Auth (separate customer + admin login)
- Supabase Postgres with Row Level Security
- Supabase Storage for product + custom order images
- Online payment checkout via Razorpay

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

Fill in your Supabase and Razorpay keys in `.env.local`. This file is **not** pushed to GitHub.

3. Apply the database schema in **Supabase → SQL Editor**:

Run the full file: `supabase/schema.sql`

4. Create the default admin user in **Supabase → SQL Editor**:

Run the full file: `supabase/admin_setup.sql`

Default admin login:

```text
URL:      /dashboard/login
Email:    admin@ridaboutique.in
Password: RidaAdmin@2026
```

Change this password before going live.

5. Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`

## Routes

**Customer (storefront):**

- `/` — Home
- `/products`, `/products/[slug]`
- `/cart`, `/checkout`
- `/login`, `/signup`, `/reset-password`
- `/account`, `/orders`, `/wishlist`
- `/custom-orders` (login required)
- `/about`, `/contact`, `/faq`
- Policy pages

**Admin (dashboard):**

- `/dashboard/login` — Admin login only
- `/dashboard` — Dashboard home
- `/dashboard/products`, `/dashboard/products/new`, `/dashboard/products/[id]`
- `/dashboard/orders`, `/dashboard/custom-orders`, `/dashboard/reviews`
- `/dashboard/customers`, `/dashboard/categories`, `/dashboard/banners`
- `/dashboard/content`, `/dashboard/contact-details`, `/dashboard/settings`

Legacy `/admin/*` URLs redirect to `/dashboard/*`.

Customer accounts cannot use `/dashboard/login`. Admin accounts cannot use `/login`.

## Supabase tables

- `profiles`, `products`, `categories`, `orders`, `order_items`
- `wishlist`, `banners`, `website_content`, `contact_details`, `settings`
- `custom_orders`, `addresses`, `reviews`

Product and custom-order reference images use the public `product-images` Storage bucket.

Homepage banners: managed from `/dashboard/banners`. Multiple active banners rotate in a carousel on the home page.

## Vercel deployment checklist

Git push alone is **not** enough for the live site. After importing from GitHub:

1. **Environment variables** — add all keys from `.env.example` in Vercel → Project Settings → Environment Variables (same values as your `.env.local`).

2. **Supabase SQL** — run `supabase/schema.sql` and `supabase/admin_setup.sql` in your Supabase project (once per database).

3. **Redeploy** — trigger a new deploy after env vars are saved.

4. **Admin login** — use `/dashboard/login` on your live domain, not `/login`.

Build command: `npm run build`
