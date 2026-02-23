import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({
          error: "Missing or invalid Authorization header",
          code: "missing_auth_header",
          hint: "When calling from the app, you must be logged in. When testing from the Dashboard, add header: Authorization = Bearer <your_access_token>",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.slice(7).trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const siteUrl = Deno.env.get("SITE_URL") ?? req.headers.get("Origin") ?? "";

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: userData, error: userError } = await userClient.auth.getUser();
    const caller = userData?.user;
    if (!caller) {
      return new Response(
        JSON.stringify({
          error: "Invalid or expired token",
          code: "invalid_token",
          hint: userError?.message ?? "Ensure you are logged in and use the session access_token from the same Supabase project.",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { inviteToken } = body as { inviteToken?: string };
    if (!inviteToken || typeof inviteToken !== "string") {
      return new Response(
        JSON.stringify({ error: "inviteToken is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: invite, error: inviteError } = await adminClient
      .from("invites")
      .select("email, institution_id, created_by, used_at, expires_at")
      .eq("token", inviteToken)
      .single();

    if (inviteError || !invite || invite.used_at || new Date(invite.expires_at) <= new Date()) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired invite" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (invite.created_by !== caller.id) {
      return new Response(
        JSON.stringify({ error: "You can only send email for invites you created" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: institution } = await adminClient
      .from("institutions")
      .select("name")
      .eq("id", invite.institution_id)
      .single();

    const institutionName = (institution as { name?: string } | null)?.name ?? "the institution";
    const inviteLink = `${siteUrl.replace(/\/$/, "")}/signup?invite=${inviteToken}`;

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          error: "Email is not configured",
          inviteLink,
          message: "Set RESEND_API_KEY in Supabase secrets to send invite emails.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fromEmail = Deno.env.get("RESEND_FROM") ?? "AI Teacher <onboarding@resend.dev>";

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [invite.email],
        subject: `You're invited to join ${institutionName}`,
        html: `
          <p>You've been invited to join <strong>${institutionName}</strong> as a teacher.</p>
          <p>Click the link below to create your account and get started. This link expires in 7 days.</p>
          <p><a href="${inviteLink}" style="color: #2563eb; text-decoration: underline;">Accept invite and sign up</a></p>
          <p>Or copy this link into your browser:</p>
          <p style="word-break: break-all; color: #64748b; font-size: 14px;">${inviteLink}</p>
        `.trim(),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", res.status, err);
      return new Response(
        JSON.stringify({
          error: "Failed to send email",
          inviteLink,
          details: err,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, message: "Invite email sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
