import { database, hashToken, type Plan } from "@/app/lib/auth";
import { clampRequestedLeads, planEntitlements, usageWindowStart } from "@/app/lib/entitlements";
import { writeAuditEvent } from "@/app/lib/security";

type OperationalUser = { token_id: string; user_id: string; plan: Plan; trial_ends_at: string; status: string; email_verified_at: string | null };

async function operationalUser(rawToken: string) {
  return database().prepare(
    `SELECT t.id AS token_id, t.user_id, u.plan, u.trial_ends_at, u.status, u.email_verified_at
     FROM operational_access_tokens t JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = ? AND t.revoked_at IS NULL AND t.expires_at > CURRENT_TIMESTAMP`,
  ).bind(await hashToken(rawToken)).first<OperationalUser>();
}

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const rawToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (rawToken.length < 32) return Response.json({ error: "Acesso operacional inválido." }, { status: 401 });

  const user = await operationalUser(rawToken);
  if (!user || user.status !== "active" || !user.email_verified_at) return Response.json({ error: "Acesso operacional expirado." }, { status: 401 });
  if (user.plan === "trial" && new Date(user.trial_ends_at).getTime() < Date.now()) return Response.json({ error: "Seu teste grátis terminou.", code: "TRIAL_EXPIRED" }, { status: 403 });

  const body = await request.json().catch(() => null) as { requestedResults?: number; source?: string } | null;
  const policy = planEntitlements[user.plan];
  const source = String(body?.source ?? "unknown").slice(0, 40);
  const requested = Math.max(1, Math.floor(Number(body?.requestedResults) || policy.maxResultsPerSearch));
  const windowStart = usageWindowStart(user.plan);
  const eventId = crypto.randomUUID();

  const reservation = await database().prepare(
    `WITH current_usage AS (
       SELECT COALESCE(SUM(quantity), 0) AS used
       FROM usage_events
       WHERE user_id = ? AND action = 'search' AND datetime(created_at) >= datetime(?)
     )
     INSERT INTO usage_events (id, user_id, action, quantity, source, correlation_id)
     SELECT ?, ?, 'search', MIN(?, MAX(0, ? - used)), ?, ?
     FROM current_usage
     WHERE used < ?
     RETURNING quantity`,
  ).bind(
    user.user_id,
    windowStart,
    eventId,
    user.user_id,
    Math.min(requested, policy.maxResultsPerSearch),
    policy.leadLimit,
    source,
    eventId,
    policy.leadLimit,
  ).first<{ quantity: number }>();

  const reserved = clampRequestedLeads(user.plan, reservation?.quantity ?? 0, reservation?.quantity ?? 0);
  if (!reservation || reserved === 0) return Response.json({ error: "Limite de leads atingido.", code: "LIMIT_REACHED", remaining: 0 }, { status: 429 });

  await database().prepare("UPDATE operational_access_tokens SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?").bind(user.token_id).run();
  const used = await database().prepare(
    "SELECT COALESCE(SUM(quantity), 0) AS total FROM usage_events WHERE user_id = ? AND action = 'search' AND datetime(created_at) >= datetime(?)",
  ).bind(user.user_id, windowStart).first<{ total: number }>();
  await writeAuditEvent({
    action: "operational.search_reserved",
    actorUserId: user.user_id,
    targetUserId: user.user_id,
    metadata: { source, eventId, reservedLeads: reserved },
  });
  return Response.json({
    allowed: true,
    allowedResults: reserved,
    reservationId: eventId,
    remaining: Math.max(0, policy.leadLimit - (used?.total ?? policy.leadLimit)),
    leadLimit: policy.leadLimit,
    period: policy.period,
    plan: user.plan,
  }, { headers: { "Cache-Control": "no-store" } });
}
