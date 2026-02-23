-- Fix infinite recursion between classes and enrollments RLS policies.
-- The enrollments policy referenced classes, and the classes policy referenced enrollments.
-- Use a SECURITY DEFINER function so the enrollments policy no longer touches classes via RLS.

CREATE OR REPLACE FUNCTION public.class_teacher_id(p_class_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT teacher_id FROM public.classes WHERE id = p_class_id LIMIT 1;
$$;

-- Recreate enrollments policy to use the function instead of a subquery on classes
DROP POLICY IF EXISTS "Teachers can manage enrollments for their classes" ON public.enrollments;

CREATE POLICY "Teachers can manage enrollments for their classes"
  ON public.enrollments FOR ALL
  USING (public.class_teacher_id(enrollments.class_id) = auth.uid());
