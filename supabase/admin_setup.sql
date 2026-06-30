-- Run supabase/schema.sql first.
-- This creates/updates the default admin Auth user and promotes it to admin.
-- Change this password after first login if this site is going live.

do $$
declare
  admin_email text := 'admin@ridaboutique.in';
  admin_password text := 'RidaAdmin@2026';
  admin_user_id uuid;
begin
  select id
  into admin_user_id
  from auth.users
  where email = admin_email
  limit 1;

  if admin_user_id is null then
    admin_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Rida Admin'),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  else
    update auth.users
    set
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('full_name', coalesce(raw_user_meta_data->>'full_name', 'Rida Admin')),
      updated_at = now()
    where id = admin_user_id;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'auth'
      and table_name = 'identities'
      and column_name = 'provider_id'
  ) then
    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      admin_user_id,
      admin_user_id::text,
      jsonb_build_object('sub', admin_user_id::text, 'email', admin_email, 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    )
    on conflict (provider, provider_id) do update set
      identity_data = excluded.identity_data,
      updated_at = now();
  else
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      admin_user_id::text,
      admin_user_id,
      jsonb_build_object('sub', admin_user_id::text, 'email', admin_email, 'email_verified', true, 'phone_verified', false),
      'email',
      now(),
      now(),
      now()
    )
    on conflict (provider, id) do update set
      identity_data = excluded.identity_data,
      updated_at = now();
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    admin_user_id,
    admin_email,
    'Rida Admin',
    'admin'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = 'admin',
    updated_at = now();
end $$;

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
