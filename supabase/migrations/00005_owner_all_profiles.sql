-- Allow owner to read and update all profiles; provide RPC to list profiles with email.

-- Helper: true if the current user's profile has role 'owner'
CREATE OR REPLACE FUNCTION public.is_app_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
$$;

-- Owner can read all profile rows (for list-all and for updating others)
CREATE POLICY "Owner can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_app_owner());

-- Owner can update any profile row
CREATE POLICY "Owner can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_app_owner());

-- RPC: return all profiles with email (only callable by owner; uses auth.users for email)
CREATE OR REPLACE FUNCTION public.get_all_profiles_with_email()
RETURNS TABLE (
  id uuid,
  email text,
  role app_role,
  first_name text,
  last_name text,
  birth_date date,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_app_owner() THEN
    RAISE EXCEPTION 'Only owner can list all profiles';
  END IF;
  RETURN QUERY
  SELECT
    p.id,
    u.email::text,
    p.role,
    p.first_name,
    p.last_name,
    p.birth_date,
    p.created_at
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;

-- Allow authenticated users to call the RPC (function itself enforces owner)
GRANT EXECUTE ON FUNCTION public.get_all_profiles_with_email() TO authenticated;
