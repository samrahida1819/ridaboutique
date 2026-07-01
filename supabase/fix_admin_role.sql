-- Run in Supabase → SQL Editor if admin login says "not marked as admin".
-- Promotes admin@ridaboutique.in to admin role.

insert into public.profiles (id, email, full_name, role)
select id, email, 'Rida Admin', 'admin'
from auth.users
where lower(email) = lower('admin@ridaboutique.in')
on conflict (id) do update set
  email = excluded.email,
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  role = 'admin',
  updated_at = now();
