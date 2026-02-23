import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { authKeys } from "@/queries/auth";

const INVITE_EXPIRY_DAYS = 7;

function generateToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface CreateInviteParams {
  email: string;
  institutionId: string;
  role?: "teacher" | "student";
}

export interface CreateInviteResult {
  token: string;
  inviteLink: string;
}

export async function createInvite(params: CreateInviteParams): Promise<CreateInviteResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const { error } = await supabase.from("invites").insert({
    institution_id: params.institutionId,
    email: params.email.trim().toLowerCase(),
    token,
    role: params.role ?? "teacher",
    created_by: user.id,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw error;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const inviteLink = `${baseUrl}/signup?invite=${token}`;

  return { token, inviteLink };
}

export function useCreateInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() });
    },
  });
}
