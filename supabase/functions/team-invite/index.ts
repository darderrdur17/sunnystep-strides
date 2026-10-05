import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const buildInviteHtml = (params: {
  inviterName: string;
  teamName: string;
  role: string;
  inviteUrl: string;
}) => `
  <div style="font-family: Inter, Arial, sans-serif; background: #fff7f0; padding: 32px;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #f2e3d9;">
      <h2 style="margin: 0 0 12px; color: #2b1f19;">You're invited to ${params.teamName}</h2>
      <p style="margin: 0 0 16px; color: #5b4b43; line-height: 1.5;">
        ${params.inviterName} invited you to join <strong>${params.teamName}</strong> on Sunnystep as a <strong>${params.role}</strong>.
      </p>
      <p style="margin: 0 0 24px; color: #5b4b43; line-height: 1.5;">
        Click the button below to accept your invitation and get started.
      </p>
      <a
        href="${params.inviteUrl}"
        style="display: inline-block; padding: 12px 20px; border-radius: 999px; background: #f26d4b; color: #ffffff; text-decoration: none; font-weight: 600;"
      >
        Accept invitation
      </a>
      <p style="margin: 24px 0 0; color: #8a7a70; font-size: 12px;">
        If the button doesn't work, copy and paste this link into your browser: ${params.inviteUrl}
      </p>
    </div>
  </div>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, inviterName, teamName, inviteUrl, role } = await req.json();

    if (!email || !teamName || !inviteUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Sunnystep <no-reply@sunnystep.ai>";

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const safeInviter = inviterName || "Team admin";
    const safeRole = role || "viewer";
    const subject = `You're invited to join ${teamName} on Sunnystep`;
    const text = `${safeInviter} invited you to join ${teamName} on Sunnystep as a ${safeRole}. Accept here: ${inviteUrl}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject,
        text,
        html: buildInviteHtml({
          inviterName: safeInviter,
          teamName,
          role: safeRole,
          inviteUrl,
        }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Email service error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ id: data.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Invite error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
