# Rida Boutique

Premium boutique ecommerce website built with Next.js App Router, Tailwind CSS, Supabase, and Vercel-ready deployment.

## Stack

- Next.js App Router
- React 19
- Tailwind CSS
- Supabase Auth email/password
- Supabase Postgres with Row Level Security
- Supabase Storage for product images
- Online payment checkout via Razorpay (UPI, cards, netbanking, wallets)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://zupkwctshyqurixsajmr.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_6_ktwkmKD_TYT7IP2OPT4Q_URgp4-5u
```

3. Apply the database schema in Supabase SQL Editor:

```bash
supabase/schema.sql
```

4. Create/update the default admin in Supabase SQL Editor:

```sql
supabase/admin_setup.sql
```

Default admin login after running the script:

```text
Email: admin@ridaboutique.in
Password: RidaAdmin@2026
```

Change this password in Supabase Authentication before going live.

5. Run locally:

```bash
npm run dev
```

## Routes

Customer pages:

- `/`
- `/products`
- `/products/[slug]`
- `/cart`
- `/checkout`
- `/login`
- `/signup`
- `/reset-password`
- `/account`
- `/orders`
- `/wishlist`
- `/about`
- `/custom-orders`
- `/contact`
- `/faq`
- `/privacy-policy`
- `/terms-conditions`
- `/shipping-policy`
- `/return-policy`

Admin pages:

- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/[id]`
- `/admin/orders`
- `/admin/customers`
- `/admin/categories`
- `/admin/banners`
- `/admin/content`
- `/admin/contact-details`
- `/admin/settings`

## Supabase

The schema creates:

- `profiles`
- `products`
- `categories`
- `orders`
- `order_items`
- `wishlist`
- `banners`
- `website_content`
- `contact_details`
- `settings`

RLS policies allow public reads for active storefront data, customer-only access to personal orders/wishlist, and admin-only management for catalog, orders, customers, content, banners, contact details, and settings.

Product images use the public `product-images` Supabase Storage bucket. Admin image upload is controlled by the admin RLS policy.

Homepage marketing banner:

- Appears below the trust strip and above categories.
- Managed from `/admin/banners`.
- Fresh installs get one seeded custom-order banner from `supabase/schema.sql`.

## Vercel Deployment

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add the same environment variables in Vercel Project Settings.
4. Deploy. Vercel will auto-detect Next.js.

Build command:

```bash
npm run build
```

Output is handled by Vercel automatically.
