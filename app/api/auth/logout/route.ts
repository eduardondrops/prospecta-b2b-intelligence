import { database, expiredSessionCookie, hashToken, readSessionToken } from "@/app/lib/auth";
import { requireSameOrigin, writeAuditEvent } from "@/app/lib/security";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const token = readSessionToken(request);
  if (token) {
    const tokenHash = await hashToken(token);
    const session = await database().prepare("SELECT user_id FROM sessions WHERE token_hash = ?").bind(tokenHash).first<{ user_id: string }>();
    await database().prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?").bind(tokenHash).run();
    if (session) await writeAuditEvent({ action: "session.revoked", actorUserId: session.user_id, targetUserId: session.user_id });
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": expiredSessionCookie(), "Cache-Control": "no-store" } });
}
