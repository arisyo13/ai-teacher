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

export const PENDING_INVITE_ERROR = "PENDING_INVITE";

export async function createInvite(params: CreateInviteParams): Promise<CreateInviteResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const email = params.email.trim().toLowerCase();

  // Mark expired invites so the unique index allows a new one
  await supabase
    .from("invites")
    .update({ used_at: new Date().toISOString() })
    .eq("institution_id", params.institutionId)
    .eq("email", email)
    .is("used_at", null)
    .lt("expires_at", new Date().toISOString());

  const { data: existing } = await supabase
    .from("invites")
    .select("id")
    .eq("institution_id", params.institutionId)
    .eq("email", email)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (existing) {
    const e = new Error("An invite for this email is already pending.");
    (e as Error & { code?: string }).code = PENDING_INVITE_ERROR;
    throw e;
  }

  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const { error } = await supabase.from("invites").insert({
    institution_id: params.institutionId,
    email,
    token,
    role: params.role ?? "teacher",
    created_by: user.id,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    if (error.code === "23505") {
      const e = new Error("An invite for this email is already pending.");
      (e as Error & { code?: string }).code = PENDING_INVITE_ERROR;
      throw e;
    }
    throw error;
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const inviteLink = `${baseUrl}/signup?invite=${token}`;

  return { token, inviteLink };
}

export async function sendInviteEmail(inviteToken: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke("send-invite-email", {
    body: { inviteToken },
  });
  if (error) {
    console.log("sendInviteEmail error:", error);
    throw error
  };
  if (data?.error) throw new Error(data.error);
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
