import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Role } from "@/queries/auth";
import { authKeys } from "@/queries/auth";

export interface ProfileWithEmail {
  id: string;
  email: string | null;
  role: Role;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null; // YYYY-MM-DD
  created_at: string;
}

const keys = {
  all: ["users", "profiles"] as const,
  list: () => [...keys.all, "list"] as const,
};

/** Fetch all profiles with email (RPC). Only succeeds when current user is owner. */
export function useAllProfilesWithEmailQuery(enabled: boolean) {
  return useQuery({
    queryKey: keys.list(),
    queryFn: async (): Promise<ProfileWithEmail[]> => {
      const { data, error } = await supabase.rpc("get_all_profiles_with_email");
      if (error) throw error;
      return (data ?? []) as ProfileWithEmail[];
    },
    enabled,
  });
}

/** Update any user's profile (role, first_name, last_name, birth_date). Owner only (RLS). */
export function useUpdateUserProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: string;
      role: Role;
      first_name: string | null;
      last_name: string | null;
      birth_date: string | null; // YYYY-MM-DD
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          role: params.role,
          first_name: params.first_name?.trim() || null,
          last_name: params.last_name?.trim() || null,
          birth_date: params.birth_date || null,
        })
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.list() });
      qc.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}
