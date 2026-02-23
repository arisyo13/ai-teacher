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
};

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
      qc.invalidateQueries({ queryKey: keys.list(teacherId) });
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
      qc.invalidateQueries({ queryKey: keys.list(teacherId) });
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
      qc.invalidateQueries({ queryKey: keys.list(teacherId) });
    },
  });
}
