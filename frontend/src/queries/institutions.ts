import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { authKeys } from "@/queries/auth";

export interface Institution {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

const keys = {
  all: ["institutions"] as const,
  detail: (id: string | null) => [...keys.all, id] as const,
};

export function useInstitutionQuery(institutionId: string | null | undefined) {
  return useQuery({
    queryKey: keys.detail(institutionId ?? null),
    queryFn: async (): Promise<Institution | null> => {
      if (!institutionId) return null;
      const { data, error } = await supabase
        .from("institutions")
        .select("id, name, owner_id, created_at")
        .eq("id", institutionId)
        .single();
      if (error) return null;
      return data as Institution;
    },
    enabled: !!institutionId,
  });
}

export function useUpdateInstitutionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ institutionId, name }: { institutionId: string; name: string }) => {
      const { error } = await supabase
        .from("institutions")
        .update({ name: name.trim() })
        .eq("id", institutionId);
      if (error) throw error;
    },
    onSuccess: (_, { institutionId }) => {
      queryClient.invalidateQueries({ queryKey: keys.detail(institutionId) });
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}
