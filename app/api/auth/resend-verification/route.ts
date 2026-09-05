import { createAccountToken, database, hashToken, normalizeEmail } from "@/app/lib/auth";
import { sendAccountEmail } from "@/app/lib/email";
import { enforceRateLimit, rateLimitResponse, requestFingerprint, requireSameOrigin } from "@/app/lib/security";

type UserRow = { id: string; name: string; email_verified_at: string | null };

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = normalizeEmail(body?.email ?? "");
  const fingerprint = await requestFingerprint(request);
  const limit = await enforceRateLimit(`resend:${fingerprint}:${await hashToken(email)}`, 3, 60 * 60);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  const user = await database().prepare("SELECT id, name, email_verified_at FROM users WHERE email = ? AND status = 'active'").bind(email).first<UserRow>();
  if (user && !user.email_verified_at) {
    const token = await createAccountToken(user.id, "verify_email", 24 * 60 * 60);
    await sendAccountEmail({ idempotencyKey: token.id, kind: "verify_email", email, name: user.name, token: token.rawToken });
  }
  return Response.json({ ok: true, message: "Se a conta estiver pendente, um novo e-mail será enviado." }, { headers: { "Cache-Control": "no-store" } });
}
