-- Adds email column to the users table to store registration emails
alter table public.users
  add column if not exists email text;

-- Enforce case-insensitive uniqueness for non-null emails
create unique index if not exists users_email_lower_idx
  on public.users (lower(email))
  where email is not null;

