-- Add birth_date to profiles (required at signup, display-only on account)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_date date;
