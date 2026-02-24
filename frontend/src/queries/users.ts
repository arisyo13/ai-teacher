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
  listPaginated: (params: PaginatedParams) => [...keys.all, "list", "paginated", params] as const,
};

export interface PaginatedParams {
  page: number;
  pageSize: number;
  search: string;
  role: Role | "";
  orderBy: string;
  orderDir: "asc" | "desc";
}

export interface PaginatedProfilesResult {
  data: ProfileWithEmail[];
  total: number;
}

/** Fetch profiles with email (paginated). Only succeeds when current user is owner. */
export function useProfilesPaginatedQuery(enabled: boolean, params: PaginatedParams) {
  return useQuery({
    queryKey: keys.listPaginated(params),
    queryFn: async (): Promise<PaginatedProfilesResult> => {
      const { data, error } = await supabase.rpc("get_all_profiles_with_email_paginated", {
        p_limit: params.pageSize,
        p_offset: (params.page - 1) * params.pageSize,
        p_search: params.search.trim() || null,
        p_role: params.role || null,
        p_order_by: params.orderBy,
        p_order_dir: params.orderDir,
      });
      if (error) {
        console.error("error", error);
        throw error;
      };
      const result = data as { data: ProfileWithEmail[]; total: number } | null;
      console.log("result", result);
      return result ?? { data: [], total: 0 };
    },
    enabled,
  });
}

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
      qc.invalidateQueries({ queryKey: keys.all });
      qc.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}
