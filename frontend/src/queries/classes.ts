import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { keys as subjectKeys } from "@/queries/subjects";

export interface ClassRow {
  id: string;
  name: string;
  subject_id: string;
  teacher_id: string;
  created_at: string;
}

const keys = {
  all: ["classes"] as const,
  list: (subjectId: string) => [...keys.all, subjectId] as const,
  byTeacher: (teacherId: string) => [...keys.all, "teacher", teacherId] as const,
  byTeacherPaginated: (teacherId: string, page: number, pageSize: number) =>
    [...keys.all, "teacher", teacherId, "paginated", page, pageSize] as const,
};

export interface ClassesPaginatedResult {
  data: ClassRow[];
  total: number;
}

export function useClassesByTeacherQuery(teacherId: string | undefined) {
  return useQuery({
    queryKey: keys.byTeacher(teacherId ?? ""),
    queryFn: async (): Promise<ClassRow[]> => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, subject_id, teacher_id, created_at")
        .eq("teacher_id", teacherId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClassRow[];
    },
    enabled: !!teacherId,
  });
}

export function useClassesByTeacherPaginatedQuery(
  teacherId: string | undefined,
  page: number,
  pageSize: number
) {
  return useQuery({
    queryKey: keys.byTeacherPaginated(teacherId ?? "", page, pageSize),
    queryFn: async (): Promise<ClassesPaginatedResult> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from("classes")
        .select("id, name, subject_id, teacher_id, created_at", { count: "exact" })
        .eq("teacher_id", teacherId!)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data: (data ?? []) as ClassRow[], total: count ?? 0 };
    },
    enabled: !!teacherId,
  });
}

export function useClassesQuery(subjectId: string | undefined) {
  return useQuery({
    queryKey: keys.list(subjectId ?? ""),
    queryFn: async (): Promise<ClassRow[]> => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, subject_id, teacher_id, created_at")
        .eq("subject_id", subjectId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClassRow[];
    },
    enabled: !!subjectId,
  });
}

export function useCreateClassMutation(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      subjectId,
    }: {
      name: string;
      subjectId: string;
    }) => {
      const { data, error } = await supabase
        .from("classes")
        .insert({
          name: name.trim(),
          subject_id: subjectId,
          teacher_id: teacherId,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
}

export function useUpdateClassMutation(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; subjectId: string; name: string }) => {
      const { error } = await supabase
        .from("classes")
        .update({ name: name.trim() })
        .eq("id", id)
        .eq("teacher_id", teacherId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
}

export function useDeleteClassMutation(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; subjectId: string }) => {
      const { error } = await supabase.from("classes").delete().eq("id", id).eq("teacher_id", teacherId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: subjectKeys.all });
    },
  });
}
