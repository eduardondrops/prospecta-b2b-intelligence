import { database, hashToken, initialAdminEmail } from "@/app/lib/auth";
import { enforceRateLimit, rateLimitResponse, requestFingerprint, requireSameOrigin, writeAuditEvent } from "@/app/lib/security";

type TokenRow = { id: string; user_id: string; email: string };

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const fingerprint = await requestFingerprint(request);
  const limit = await enforceRateLimit(`verify:${fingerprint}`, 10, 15 * 60);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  const body = await request.json().catch(() => null) as { token?: string } | null;
  const token = body?.token ?? "";
  if (token.length < 32) return Response.json({ error: "Link de verificação inválido." }, { status: 400 });
  const row = await database().prepare(
    `SELECT t.id, t.user_id, u.email FROM account_tokens t
     JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = ? AND t.purpose = 'verify_email' AND t.consumed_at IS NULL AND t.expires_at > CURRENT_TIMESTAMP`,
  ).bind(await hashToken(token)).first<TokenRow>();
  if (!row) return Response.json({ error: "Este link é inválido ou expirou." }, { status: 400 });

  const role = row.email === initialAdminEmail() ? "admin" : "user";
  await database().batch([
    database().prepare("UPDATE users SET email_verified_at = COALESCE(email_verified_at, CURRENT_TIMESTAMP), role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(role, row.user_id),
    database().prepare("UPDATE account_tokens SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.id),
  ]);
  await writeAuditEvent({ action: "email.verified", actorUserId: row.user_id, targetUserId: row.user_id, metadata: { role } });
  return Response.json({ ok: true, role }, { headers: { "Cache-Control": "no-store" } });
}
