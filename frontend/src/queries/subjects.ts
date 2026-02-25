import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface SubjectRow {
  id: string;
  name: string;
  description: string | null;
  teacher_id: string;
  created_at: string;
}

export interface ClassRow {
  id: string;
  name: string;
  subject_id: string;
  teacher_id: string;
  created_at: string;
}

export const keys = {
  all: ["subjects"] as const,
  list: (teacherId: string) => [...keys.all, teacherId] as const,
  listPaginated: (teacherId: string, page: number, pageSize: number) =>
    [...keys.all, teacherId, "paginated", page, pageSize] as const,
};

export interface SubjectsPaginatedResult {
  data: SubjectRow[];
  total: number;
}

export function useSubjectsQuery(teacherId: string | undefined) {
  return useQuery({
    queryKey: keys.list(teacherId ?? ""),
    queryFn: async (): Promise<SubjectRow[]> => {
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, description, teacher_id, created_at")
        .eq("teacher_id", teacherId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SubjectRow[];
    },
    enabled: !!teacherId,
  });
}

export function useSubjectsPaginatedQuery(
  teacherId: string | undefined,
  page: number,
  pageSize: number
) {
  return useQuery({
    queryKey: keys.listPaginated(teacherId ?? "", page, pageSize),
    queryFn: async (): Promise<SubjectsPaginatedResult> => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count } = await supabase
        .from("subjects")
        .select("id, name, description, teacher_id, created_at", { count: "exact" })
        .eq("teacher_id", teacherId!)
        .order("created_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      return { data: (data ?? []) as SubjectRow[], total: count ?? 0 };
    },
    enabled: !!teacherId,
  });
}

export function useCreateSubjectMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      description,
      teacherId,
    }: {
      name: string;
      description: string;
      teacherId: string;
    }) => {
      const { data, error } = await supabase
        .from("subjects")
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          teacher_id: teacherId,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: (_, { teacherId }) => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateSubjectMutation(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: {
      id: string;
      name: string;
      description: string;
    }) => {
      const { error } = await supabase
        .from("subjects")
        .update({
          name: name.trim(),
          description: description.trim() || null,
        })
        .eq("id", id)
        .eq("teacher_id", teacherId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteSubjectMutation(teacherId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subjects").delete().eq("id", id).eq("teacher_id", teacherId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}
