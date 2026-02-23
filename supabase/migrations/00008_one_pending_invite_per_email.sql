-- Deduplicate: keep newest pending invite per (institution_id, email), mark older ones as used.
UPDATE public.invites
SET used_at = created_at
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY institution_id, email ORDER BY created_at DESC NULLS LAST) AS rn
    FROM public.invites
    WHERE used_at IS NULL
  ) sub
  WHERE sub.rn > 1
);

-- At most one pending (unused) invite per institution + email.
-- (Expired invites are cleared in app before insert so they don't block new invites.)
CREATE UNIQUE INDEX idx_invites_one_pending_per_email
  ON public.invites (institution_id, email)
  WHERE used_at IS NULL;
