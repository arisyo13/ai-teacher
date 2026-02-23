-- Replace display_name with first_name and last_name on profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text;

-- Migrate existing display_name: first word -> first_name, rest -> last_name
UPDATE public.profiles
SET
  first_name = COALESCE(NULLIF(TRIM(SPLIT_PART(COALESCE(display_name, ''), ' ', 1)), ''), NULL),
  last_name = CASE
    WHEN display_name IS NULL OR TRIM(display_name) = '' THEN NULL
    WHEN POSITION(' ' IN TRIM(display_name)) = 0 THEN NULL
    ELSE NULLIF(TRIM(SUBSTRING(TRIM(display_name) FROM POSITION(' ' IN TRIM(display_name)) + 1)), '')
  END
WHERE display_name IS NOT NULL AND (first_name IS NULL AND last_name IS NULL);

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS display_name;
