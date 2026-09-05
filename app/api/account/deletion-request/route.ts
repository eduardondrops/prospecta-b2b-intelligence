import { currentUser, database, expiredSessionCookie } from "@/app/lib/auth";
import { requireSameOrigin, writeAuditEvent } from "@/app/lib/security";

export async function POST(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "Sessão inválida." }, { status: 401 });
  if (user.role === "admin") return Response.json({ error: "Transfira a administração antes de solicitar a exclusão desta conta." }, { status: 409 });

  await database().batch([
    database().prepare("INSERT INTO account_deletion_requests (id, user_id) VALUES (?, ?)").bind(crypto.randomUUID(), user.id),
    database().prepare("UPDATE users SET status = 'deletion_requested', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(user.id),
    database().prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL").bind(user.id),
  ]);
  await writeAuditEvent({ action: "account.deletion_requested", actorUserId: user.id, targetUserId: user.id });
  return Response.json({ ok: true }, { headers: { "Set-Cookie": expiredSessionCookie(), "Cache-Control": "no-store" } });
}
