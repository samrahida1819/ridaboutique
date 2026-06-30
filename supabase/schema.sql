create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  phone text,
  address text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  price numeric(12, 2) not null check (price >= 0),
  sale_price numeric(12, 2) check (sale_price is null or sale_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  description text not null default '',
  image_urls text[] not null default '{}',
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  payment_method text not null default 'razorpay' check (payment_method in ('cod', 'razorpay')),
  payment_status text not null default 'pending',
  status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled')),
  subtotal numeric(12, 2) not null default 0,
  delivery_charges numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  total numeric(12, 2) not null check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.website_content (
  key text primary key check (key in ('about', 'faq', 'privacy', 'terms', 'shipping', 'returns')),
  title text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_details (
  id smallint primary key default 1 check (id = 1),
  store_name text not null default 'Rida Boutique',
  email text not null default 'care@ridaboutique.in',
  primary_phone text not null default '+91 70000 00000',
  secondary_phone text not null default '+91 70000 00001',
  whatsapp_number text not null default '+91 70000 00000',
  business_address text not null default 'Srinagar, Jammu and Kashmir, India',
  google_maps_link text not null default 'https://maps.google.com',
  working_hours text not null default 'Monday to Saturday, 10:00 AM - 7:00 PM',
  instagram_link text not null default 'https://instagram.com',
  facebook_link text not null default 'https://facebook.com',
  youtube_link text not null default 'https://youtube.com',
  updated_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders for each row execute function public.set_updated_at();
drop trigger if exists banners_set_updated_at on public.banners;
create trigger banners_set_updated_at before update on public.banners for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    'customer'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    phone = coalesce(public.profiles.phone, excluded.phone);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.banners enable row level security;
alter table public.website_content enable row level security;
alter table public.contact_details enable row level security;
alter table public.settings enable row level security;

drop policy if exists "Profiles are viewable by owner or admin" on public.profiles;
create policy "Profiles are viewable by owner or admin"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

drop policy if exists "Customers can insert own profile" on public.profiles;
create policy "Customers can insert own profile"
on public.profiles for insert
with check (auth.uid() = id and role = 'customer');

drop policy if exists "Customers can update own profile" on public.profiles;
create policy "Customers can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id and role = 'customer');

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories"
on public.categories for select
using (active = true or public.is_admin());

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
on public.products for select
using (active = true or public.is_admin());

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Customers can view own orders" on public.orders;
create policy "Customers can view own orders"
on public.orders for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Customers can create own orders" on public.orders;
create policy "Customers can create own orders"
on public.orders for insert
with check (user_id = auth.uid());

drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Customers can view own order items" on public.order_items;
create policy "Customers can view own order items"
on public.order_items for select
using (
  public.is_admin()
  or exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "Customers can add own order items" on public.order_items;
create policy "Customers can add own order items"
on public.order_items for insert
with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

drop policy if exists "Admins can manage order items" on public.order_items;
create policy "Admins can manage order items"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Customers can manage own wishlist" on public.wishlist;
create policy "Customers can manage own wishlist"
on public.wishlist for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "Public can view active banners" on public.banners;
create policy "Public can view active banners"
on public.banners for select
using (active = true or public.is_admin());

drop policy if exists "Admins can manage banners" on public.banners;
create policy "Admins can manage banners"
on public.banners for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can view website content" on public.website_content;
create policy "Public can view website content"
on public.website_content for select
using (true);

drop policy if exists "Admins can manage website content" on public.website_content;
create policy "Admins can manage website content"
on public.website_content for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can view contact details" on public.contact_details;
create policy "Public can view contact details"
on public.contact_details for select
using (true);

drop policy if exists "Admins can manage contact details" on public.contact_details;
create policy "Admins can manage contact details"
on public.contact_details for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public can view settings" on public.settings;
create policy "Public can view settings"
on public.settings for select
using (true);

drop policy if exists "Admins can manage settings" on public.settings;
create policy "Admins can manage settings"
on public.settings for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and public.is_admin());

-- Logged-in customers can upload custom order reference images into the custom-orders/ folder.
drop policy if exists "Customers can upload custom order references" on storage.objects;
create policy "Customers can upload custom order references"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = 'custom-orders');

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects for update
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects for delete
using (bucket_id = 'product-images' and public.is_admin());

insert into public.categories (name, slug, description, active)
values
  ('Women''s Fashion', 'womens-fashion', 'Premium boutique fashion pieces.', true),
  ('Hijabs', 'hijabs', 'Everyday and occasion hijabs.', true),
  ('Custom Earrings', 'custom-earrings', 'Made-to-order earrings and accessories.', true),
  ('Custom Gifts', 'custom-gifts', 'Personalized gifts and cash bouquets.', true),
  ('Accessories', 'accessories', 'Boutique accessories and finishing pieces.', true)
on conflict (slug) do nothing;

insert into public.banners (id, title, subtitle, image_url, link_url, active, sort_order)
values (
  '00000000-0000-0000-0000-000000000101',
  'Occasion gifts, made to feel personal.',
  'Reserve custom frames, earrings, cash bouquets, and curated gift boxes with clear pricing before checkout.',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=86',
  '/custom-orders',
  true,
  1
)
on conflict (id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  image_url = excluded.image_url,
  link_url = excluded.link_url,
  active = excluded.active,
  sort_order = excluded.sort_order;

insert into public.website_content (key, title, body)
values
  ('about', 'About Us', 'Rida Boutique is a premium boutique for elegant womenswear, hijabs, accessories, and thoughtful custom gifting with clear checkout and custom-order approval.'),
  ('faq', 'FAQ', 'How do I place an order?\nAdd items to cart, open Buy now, and place your order.\n\nCan I request custom products?\nYes. Contact us with your reference, budget, and date.'),
  ('privacy', 'Privacy Policy', 'We collect only the information needed to create accounts, process orders, deliver products, and support customers.'),
  ('terms', 'Terms & Conditions', 'By using Rida Boutique, you agree to provide accurate account and delivery information and follow store policies.'),
  ('shipping', 'Shipping Policy', 'Orders are prepared after confirmation. Delivery charges are shown at checkout.'),
  ('returns', 'Return Policy', 'Eligible unused products can be returned within the stated return window. Custom products are not return eligible unless defective.')
on conflict (key) do nothing;

insert into public.contact_details (id)
values (1)
on conflict (id) do nothing;

insert into public.settings (key, value)
values
  ('store_name', '"Rida Boutique"'::jsonb),
  ('logo_url', '""'::jsonb),
  ('delivery_charges', '120'::jsonb),
  ('default_theme', '"light"'::jsonb),
  ('instagram_link', '"https://instagram.com"'::jsonb),
  ('facebook_link', '"https://facebook.com"'::jsonb),
  ('youtube_link', '"https://youtube.com"'::jsonb)
on conflict (key) do nothing;

-- =====================================================================
-- Custom orders, saved addresses, and product reviews
-- =====================================================================

create table if not exists public.custom_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  full_name text not null,
  phone text not null,
  email text,
  product_type text not null,
  quantity integer not null default 1 check (quantity > 0),
  description text not null,
  reference_links text,
  reference_image_url text,
  budget text,
  delivery_date date,
  delivery_area text,
  notes text,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected', 'Converted')),
  quoted_price numeric(12, 2) check (quoted_price is null or quoted_price >= 0),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Address',
  full_name text not null,
  phone text not null,
  address text,
  district text not null,
  pincode text not null,
  landmark text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  product_name text,
  customer text not null,
  rating integer not null check (rating between 1 and 5),
  body text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_product_id_idx on public.reviews(product_id);

-- Link custom orders to a customer account (nullable for guest submissions).
alter table public.custom_orders add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists custom_orders_user_id_idx on public.custom_orders(user_id);

drop trigger if exists custom_orders_set_updated_at on public.custom_orders;
create trigger custom_orders_set_updated_at before update on public.custom_orders for each row execute function public.set_updated_at();
drop trigger if exists addresses_set_updated_at on public.addresses;
create trigger addresses_set_updated_at before update on public.addresses for each row execute function public.set_updated_at();
drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at before update on public.reviews for each row execute function public.set_updated_at();

alter table public.custom_orders enable row level security;
alter table public.addresses enable row level security;
alter table public.reviews enable row level security;

-- Custom orders: anyone can submit a request; customers see their own, admins manage all.
drop policy if exists "Anyone can submit custom orders" on public.custom_orders;
create policy "Anyone can submit custom orders"
on public.custom_orders for insert
with check (status = 'Pending' and (user_id is null or user_id = auth.uid()));

drop policy if exists "Customers can view own custom orders" on public.custom_orders;
create policy "Customers can view own custom orders"
on public.custom_orders for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins can manage custom orders" on public.custom_orders;
create policy "Admins can manage custom orders"
on public.custom_orders for all
using (public.is_admin())
with check (public.is_admin());

-- Addresses: customers manage their own, admins can view all.
drop policy if exists "Customers can view own addresses" on public.addresses;
create policy "Customers can view own addresses"
on public.addresses for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Customers can insert own addresses" on public.addresses;
create policy "Customers can insert own addresses"
on public.addresses for insert
with check (user_id = auth.uid());

drop policy if exists "Customers can update own addresses" on public.addresses;
create policy "Customers can update own addresses"
on public.addresses for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Customers can delete own addresses" on public.addresses;
create policy "Customers can delete own addresses"
on public.addresses for delete
using (user_id = auth.uid());

-- Reviews: public can read approved, anyone can submit pending, admins moderate.
drop policy if exists "Public can view approved reviews" on public.reviews;
create policy "Public can view approved reviews"
on public.reviews for select
using (status = 'Approved' or public.is_admin());

drop policy if exists "Anyone can submit reviews" on public.reviews;
create policy "Anyone can submit reviews"
on public.reviews for insert
with check (status = 'Pending');

drop policy if exists "Admins can manage reviews" on public.reviews;
create policy "Admins can manage reviews"
on public.reviews for all
using (public.is_admin())
with check (public.is_admin());

-- To create/update the default admin Auth user, run supabase/admin_setup.sql.
-- To promote an existing Auth user manually:
-- update public.profiles set role = 'admin' where email = 'admin@ridaboutique.in';
