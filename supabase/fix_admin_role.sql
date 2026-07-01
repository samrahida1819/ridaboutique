-- Run this ONCE in Supabase → SQL Editor → Run
-- Fixes: "This account is not marked as admin"

update public.profiles
set role = 'admin', updated_at = now()
where lower(email) = lower('admin@ridaboutique.in');

insert into public.profiles (id, email, full_name, role)
select id, email, 'Rida Admin', 'admin'
from auth.users
where lower(email) = lower('admin@ridaboutique.in')
on conflict (id) do update set
  email = excluded.email,
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  role = 'admin',
  updated_at = now();

-- You should see role = admin in the result below:
select id, email, role
from public.profiles
where lower(email) = lower('admin@ridaboutique.in');
