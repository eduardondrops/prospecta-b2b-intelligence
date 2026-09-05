import { currentUser, database, expiredSessionCookie, hashToken, readSessionToken } from "@/app/lib/auth";
import { requireSameOrigin, writeAuditEvent } from "@/app/lib/security";

type SessionRow = { id: string; created_at: string; last_seen_at: string | null; expires_at: string; token_hash: string };

export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "Sessão inválida." }, { status: 401 });
  const currentHash = await hashToken(readSessionToken(request) ?? "");
  const result = await database().prepare(
    "SELECT id, created_at, last_seen_at, expires_at, token_hash FROM sessions WHERE user_id = ? AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC",
  ).bind(user.id).all<SessionRow>();
  return Response.json({ sessions: result.results.map(({ token_hash, ...session }) => ({ ...session, current: token_hash === currentHash })) }, { headers: { "Cache-Control": "no-store" } });
}

export async function DELETE(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "Sessão inválida." }, { status: 401 });
  const body = await request.json().catch(() => null) as { sessionId?: string; all?: boolean } | null;
  const currentToken = readSessionToken(request);
  const currentHash = currentToken ? await hashToken(currentToken) : "";
  let clearCookie = false;

  if (body?.all) {
    await database().prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL").bind(user.id).run();
    clearCookie = true;
  } else if (body?.sessionId) {
    const target = await database().prepare("SELECT token_hash FROM sessions WHERE id = ? AND user_id = ? AND revoked_at IS NULL").bind(body.sessionId, user.id).first<{ token_hash: string }>();
    if (!target) return Response.json({ error: "Sessão não encontrada." }, { status: 404 });
    await database().prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?").bind(body.sessionId, user.id).run();
    clearCookie = target.token_hash === currentHash;
  } else {
    return Response.json({ error: "Informe a sessão que deseja encerrar." }, { status: 400 });
  }

  await writeAuditEvent({ action: body?.all ? "sessions.revoked_all" : "session.revoked", actorUserId: user.id, targetUserId: user.id });
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (clearCookie) headers["Set-Cookie"] = expiredSessionCookie();
  return Response.json({ ok: true, signedOut: clearCookie }, { headers });
}
