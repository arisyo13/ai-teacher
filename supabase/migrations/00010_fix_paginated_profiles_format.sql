-- Fix format() %% escape in get_all_profiles_with_email_paginated (was causing error 22023).
CREATE OR REPLACE FUNCTION public.get_all_profiles_with_email_paginated(
  p_limit int DEFAULT 10,
  p_offset int DEFAULT 0,
  p_search text DEFAULT NULL,
  p_role app_role DEFAULT NULL,
  p_order_by text DEFAULT 'created_at',
  p_order_dir text DEFAULT 'desc'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total bigint;
  v_data jsonb;
  v_order_col text;
  v_dir text;
  v_sql text;
BEGIN
  IF NOT public.is_app_owner() THEN
    RAISE EXCEPTION 'Only owner can list profiles';
  END IF;

  p_limit := LEAST(GREATEST(COALESCE(p_limit, 10), 1), 100);
  p_offset := GREATEST(COALESCE(p_offset, 0), 0);
  v_order_col := CASE p_order_by
    WHEN 'email' THEN 'u.email'
    WHEN 'first_name' THEN 'p.first_name'
    WHEN 'last_name' THEN 'p.last_name'
    WHEN 'birth_date' THEN 'p.birth_date'
    WHEN 'role' THEN 'p.role::text'
    ELSE 'p.created_at'
  END;
  v_dir := CASE WHEN lower(COALESCE(p_order_dir, 'desc')) = 'asc' THEN 'ASC' ELSE 'DESC' END;

  SELECT count(*) INTO v_total
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE (p_search IS NULL OR p_search = '' OR (
    u.email ILIKE '%' || p_search || '%' OR
    p.first_name ILIKE '%' || p_search || '%' OR
    p.last_name ILIKE '%' || p_search || '%'
  ))
  AND (p_role IS NULL OR p.role = p_role);

  v_sql := format(
    $sql$
      SELECT jsonb_agg(row_to_json(t)) FROM (
        SELECT p.id, u.email::text AS email, p.role, p.first_name, p.last_name, p.birth_date, p.created_at
        FROM public.profiles p
        LEFT JOIN auth.users u ON u.id = p.id
        WHERE ($1::text IS NULL OR $1 = '' OR (
          u.email ILIKE $p$'%%'$p$ || $1 || $p$'%%'$p$ OR
          p.first_name ILIKE $p$'%%'$p$ || $1 || $p$'%%'$p$ OR
          p.last_name ILIKE $p$'%%'$p$ || $1 || $p$'%%'$p$
        ))
        AND ($2::app_role IS NULL OR p.role = $2)
        ORDER BY %s %s
        LIMIT $3 OFFSET $4
      ) t
    $sql$,
    v_order_col,
    v_dir
  );

  EXECUTE v_sql INTO v_data USING p_search, p_role, p_limit, p_offset;
  IF v_data IS NULL THEN
    v_data := '[]'::jsonb;
  END IF;

  RETURN jsonb_build_object('data', v_data, 'total', v_total);
END;
$$;
