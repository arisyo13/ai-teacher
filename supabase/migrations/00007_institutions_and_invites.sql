-- Institutions: one per owner (school/organisation)
CREATE TABLE IF NOT EXISTS public.institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_institutions_owner_id ON public.institutions(owner_id);

-- Profiles: link to institution (owner and teachers have one)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_institution_id ON public.profiles(institution_id);

-- Invites: token-based signup for teachers (and later students)
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'teacher',
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invites_token ON public.invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_institution_id ON public.invites(institution_id);

-- RLS
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Institutions: owner can do everything; teachers can read their institution
DROP POLICY IF EXISTS "Owner can manage own institution" ON public.institutions;
CREATE POLICY "Owner can manage own institution"
  ON public.institutions FOR ALL
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can read own institution" ON public.institutions;
CREATE POLICY "Users can read own institution"
  ON public.institutions FOR SELECT
  USING (
    id IN (
      SELECT institution_id FROM public.profiles WHERE id = auth.uid() AND institution_id IS NOT NULL
    )
  );

-- Invites: only owner of the institution can create/read invites for that institution
DROP POLICY IF EXISTS "Owner can manage invites for own institution" ON public.invites;
CREATE POLICY "Owner can manage invites for own institution"
  ON public.invites FOR ALL
  USING (
    institution_id IN (
      SELECT id FROM public.institutions WHERE owner_id = auth.uid()
    )
  );

-- RPC: complete owner signup (create institution + set profile to owner). Call after auth.signUp.
CREATE OR REPLACE FUNCTION public.complete_owner_signup(p_institution_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_institution_id uuid;
  v_current_role app_role;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_institution_name IS NULL OR trim(p_institution_name) = '' THEN
    RAISE EXCEPTION 'Institution name is required';
  END IF;

  SELECT role INTO v_current_role FROM public.profiles WHERE id = v_uid;
  IF v_current_role IS NULL OR v_current_role != 'student' THEN
    RAISE EXCEPTION 'Only new signups can complete owner registration';
  END IF;

  INSERT INTO public.institutions (name, owner_id)
  VALUES (trim(p_institution_name), v_uid)
  RETURNING id INTO v_institution_id;

  UPDATE public.profiles
  SET role = 'owner', institution_id = v_institution_id, updated_at = now()
  WHERE id = v_uid;

  RETURN v_institution_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_owner_signup(text) TO authenticated;

-- RPC: get invite by token (for signup page; no auth required so invitee can see context)
CREATE OR REPLACE FUNCTION public.get_invite_by_token(p_token text)
RETURNS TABLE (email text, institution_name text, role app_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.email,
    inst.name,
    i.role
  FROM public.invites i
  JOIN public.institutions inst ON inst.id = i.institution_id
  WHERE i.token = p_token
    AND i.used_at IS NULL
    AND i.expires_at > now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO authenticated;

-- RPC: consume invite (set current user's profile to teacher + institution). Call after auth.signUp.
CREATE OR REPLACE FUNCTION public.consume_invite(p_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_invite record;
  v_user_email text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email, institution_id, role INTO v_invite
  FROM public.invites
  WHERE token = p_token AND used_at IS NULL AND expires_at > now();

  IF v_invite IS NULL OR v_invite.email IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite';
  END IF;

  SELECT email INTO v_user_email FROM auth.users WHERE id = v_uid;
  IF lower(trim(v_user_email)) != lower(trim(v_invite.email)) THEN
    RAISE EXCEPTION 'Invite email does not match your account';
  END IF;

  UPDATE public.profiles
  SET role = v_invite.role, institution_id = v_invite.institution_id, updated_at = now()
  WHERE id = v_uid;

  UPDATE public.invites SET used_at = now() WHERE token = p_token;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_invite(text) TO authenticated;
