import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Role = "owner" | "admin" | "teacher" | "student";

/** Roles that can access dashboard and admin (create teachers, etc.) */
export const DASHBOARD_ROLES: Role[] = ["owner", "admin", "teacher"];

export const canAccessDashboard = (role: Role | null | undefined): boolean =>
  role != null && DASHBOARD_ROLES.includes(role);

/** Only owner can manage all users (list and edit any profile). */
export const isOwner = (role: Role | null | undefined): boolean =>
  role === "owner";

export interface Profile {
  id: string;
  role: Role;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null; // ISO date YYYY-MM-DD
  institution_id: string | null;
  created_at: string;
}

/** Full display name from profile (or fallback). */
export const getDisplayName = (
  profile: Profile | null | undefined,
  fallback: string
): string => {
  if (!profile) return fallback;
  const first = profile.first_name?.trim() ?? "";
  const last = profile.last_name?.trim() ?? "";
  const full = [first, last].filter(Boolean).join(" ");
  return full || fallback;
};

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

export type AuthSession = {
  user: SupabaseUser;
  profile: Profile | null;
};

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, first_name, last_name, birth_date, institution_id, created_at")
    .eq("id", userId)
    .single();
  if (error) {
    console.warn("[Auth] Failed to fetch profile:", error.message);
    return null;
  }
  return data as Profile;
};

export const fetchAuthSession = async (): Promise<AuthSession | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  const profile = await fetchProfile(session.user.id);
  return { user: session.user, profile };
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};

export const useSignUpMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      password,
      firstName,
      lastName,
      birthDate,
    }: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      birthDate: string; // YYYY-MM-DD
    }) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) {
        await supabase
          .from("profiles")
          .update({
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            birth_date: birthDate,
          })
          .eq("id", data.user.id);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};

export const useSignOutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => supabase.auth.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session(), null);
    },
  });
};

/** Update current user's first and last name (account page). */
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      firstName,
      lastName,
      userId,
    }: {
      firstName: string;
      lastName: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
        })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
};

export const createTeacherAccount = async (params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<{ id: string; email: string | undefined }> => {
  const { data, error } = await supabase.functions.invoke("create-teacher", {
    body: {
      email: params.email.trim(),
      password: params.password,
      firstName: params.firstName.trim() || undefined,
      lastName: params.lastName.trim() || undefined,
    },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return { id: data.id, email: data.email };
};

export const useCreateTeacherMutation = () =>
  useMutation({
    mutationFn: createTeacherAccount,
  });

/** Complete owner signup: create institution and set profile to owner. Call after signUp when no invite. */
export async function completeOwnerSignup(institutionName: string): Promise<string> {
  const { data, error } = await supabase.rpc("complete_owner_signup", {
    p_institution_name: institutionName.trim(),
  });
  if (error) throw error;
  return data as string;
}

/** Consume invite: set current user's profile to teacher + institution. Call after signUp when signing up with invite. */
export async function consumeInvite(token: string): Promise<void> {
  const { error } = await supabase.rpc("consume_invite", { p_token: token });
  if (error) throw error;
}

/** Get invite details by token (for signup page; no auth required). */
export async function getInviteByToken(
  token: string
): Promise<{ email: string; institution_name: string; role: string } | null> {
  const { data, error } = await supabase.rpc("get_invite_by_token", { p_token: token });
  if (error) return null;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.email) return null;
  return {
    email: row.email,
    institution_name: row.institution_name ?? "",
    role: row.role ?? "teacher",
  };
}
