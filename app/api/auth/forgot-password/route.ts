import { createAccountToken, database, hashToken, normalizeEmail } from "@/app/lib/auth";
import { sendAccountEmail } from "@/app/lib/email";
import { enforceRateLimit, rateLimitResponse, requestFingerprint, requireSameOrigin, writeAuditEvent } from "@/app/lib/security";

type UserRow = { id: string; name: string; email: string };

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = normalizeEmail(body?.email ?? "");
  const fingerprint = await requestFingerprint(request);
  const limit = await enforceRateLimit(`forgot:${fingerprint}:${await hashToken(email)}`, 3, 60 * 60);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  const user = await database().prepare("SELECT id, name, email FROM users WHERE email = ? AND status = 'active' AND email_verified_at IS NOT NULL").bind(email).first<UserRow>();
  if (user) {
    const token = await createAccountToken(user.id, "reset_password", 30 * 60);
    await sendAccountEmail({ idempotencyKey: token.id, kind: "reset_password", email: user.email, name: user.name, token: token.rawToken });
    await writeAuditEvent({ action: "password.reset_requested", targetUserId: user.id });
  }
  return Response.json({ ok: true, message: "Se o e-mail estiver cadastrado, você receberá as instruções." }, { headers: { "Cache-Control": "no-store" } });
}
