import { database, hashToken, planLimits, type Plan } from "@/app/lib/auth";
import { writeAuditEvent } from "@/app/lib/security";

type OperationalUser = { token_id: string; user_id: string; plan: Plan; trial_ends_at: string; status: string; email_verified_at: string | null };

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const rawToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (rawToken.length < 32) return Response.json({ error: "Acesso operacional inválido." }, { status: 401 });

  const user = await database().prepare(
    `SELECT t.id AS token_id, t.user_id, u.plan, u.trial_ends_at, u.status, u.email_verified_at
     FROM operational_access_tokens t JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = ? AND t.revoked_at IS NULL AND t.expires_at > CURRENT_TIMESTAMP`,
  ).bind(await hashToken(rawToken)).first<OperationalUser>();
  if (!user || user.status !== "active" || !user.email_verified_at) return Response.json({ error: "Acesso operacional expirado." }, { status: 401 });
  if (user.plan === "trial" && new Date(user.trial_ends_at).getTime() < Date.now()) return Response.json({ error: "Seu teste grátis terminou.", code: "TRIAL_EXPIRED" }, { status: 403 });

  const body = await request.json().catch(() => null) as { requestedResults?: number; source?: string } | null;
  const limits = planLimits[user.plan];
  const requestedResults = Math.max(1, Math.min(Math.floor(Number(body?.requestedResults) || limits.results), limits.results));
  const eventId = crypto.randomUUID();
  const result = await database().prepare(
    `INSERT INTO usage_events (id, user_id, action)
     SELECT ?, ?, 'search'
     WHERE (SELECT COUNT(*) FROM usage_events WHERE user_id = ? AND action = 'search') < ?`,
  ).bind(eventId, user.user_id, user.user_id, limits.searches).run();
  if ((result.meta.changes ?? 0) === 0) return Response.json({ error: "Limite de pesquisas atingido.", code: "LIMIT_REACHED", remaining: 0 }, { status: 429 });

  await database().prepare("UPDATE operational_access_tokens SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?").bind(user.token_id).run();
  const used = await database().prepare("SELECT COUNT(*) AS total FROM usage_events WHERE user_id = ? AND action = 'search'").bind(user.user_id).first<{ total: number }>();
  await writeAuditEvent({ action: "operational.search_authorized", actorUserId: user.user_id, targetUserId: user.user_id, metadata: { source: String(body?.source ?? "unknown").slice(0, 40), eventId } });
  return Response.json({ allowed: true, allowedResults: requestedResults, remaining: Math.max(0, limits.searches - (used?.total ?? limits.searches)), plan: user.plan }, { headers: { "Cache-Control": "no-store" } });
}
