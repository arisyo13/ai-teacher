import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Role = "teacher" | "student";

export interface Profile {
  id: string;
  role: Role;
  display_name: string | null;
  created_at: string;
}

export const authKeys = {
  all: ["auth"] as const,
  session: () => [...authKeys.all, "session"] as const,
};

export type AuthSession = {
  user: SupabaseUser;
  profile: Profile | null;
};

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, created_at")
    .eq("id", userId)
    .single();
  if (error) {
    console.warn("[Auth] Failed to fetch profile:", error.message);
    return null;
  }
  return data as Profile;
}

export async function fetchAuthSession(): Promise<AuthSession | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  const profile = await fetchProfile(session.user.id);
  return { user: session.user, profile };
}

export function useLoginMutation() {
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
}

export function useSignUpMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      password,
      displayName,
    }: {
      email: string;
      password: string;
      displayName?: string;
    }) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user && displayName?.trim()) {
        await supabase
          .from("profiles")
          .update({ display_name: displayName.trim() })
          .eq("id", data.user.id);
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}

export function useSignOutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => supabase.auth.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session(), null);
    },
  });
}

export async function createTeacherAccount(params: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<{ id: string; email: string | undefined }> {
  const { data, error } = await supabase.functions.invoke("create-teacher", {
    body: {
      email: params.email.trim(),
      password: params.password,
      displayName: params.displayName?.trim() || undefined,
    },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return { id: data.id, email: data.email };
}

export function useCreateTeacherMutation() {
  return useMutation({
    mutationFn: createTeacherAccount,
  });
}
