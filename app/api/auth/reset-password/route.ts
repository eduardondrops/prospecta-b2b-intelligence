import { database, hashPassword, hashToken } from "@/app/lib/auth";
import { enforceRateLimit, rateLimitResponse, requestFingerprint, requireSameOrigin, writeAuditEvent } from "@/app/lib/security";

type TokenRow = { id: string; user_id: string };

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const fingerprint = await requestFingerprint(request);
  const limit = await enforceRateLimit(`reset:${fingerprint}`, 6, 30 * 60);
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter);

  const body = await request.json().catch(() => null) as { token?: string; password?: string } | null;
  const token = body?.token ?? "";
  const password = body?.password ?? "";
  if (token.length < 32) return Response.json({ error: "Link de redefinição inválido." }, { status: 400 });
  if (password.length < 10 || password.length > 128) return Response.json({ error: "Use uma senha com pelo menos 10 caracteres." }, { status: 400 });

  const row = await database().prepare(
    `SELECT t.id, t.user_id FROM account_tokens t JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = ? AND t.purpose = 'reset_password' AND t.consumed_at IS NULL
       AND t.expires_at > CURRENT_TIMESTAMP AND u.status = 'active'`,
  ).bind(await hashToken(token)).first<TokenRow>();
  if (!row) return Response.json({ error: "Este link é inválido ou expirou." }, { status: 400 });

  const passwordData = await hashPassword(password);
  await database().batch([
    database().prepare("UPDATE users SET password_hash = ?, password_salt = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(passwordData.hash, passwordData.salt, row.user_id),
    database().prepare("UPDATE account_tokens SET consumed_at = CURRENT_TIMESTAMP WHERE id = ?").bind(row.id),
    database().prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL").bind(row.user_id),
  ]);
  await writeAuditEvent({ action: "password.reset_completed", actorUserId: row.user_id, targetUserId: row.user_id });
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
