import { database, hashToken, type Plan } from "@/app/lib/auth";
import { planEntitlements, usageWindowStart } from "@/app/lib/entitlements";
import { writeAuditEvent } from "@/app/lib/security";

type OperationalUser = { user_id: string; plan: Plan; status: string; email_verified_at: string | null };

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const rawToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (rawToken.length < 32) return Response.json({ error: "Acesso operacional inválido." }, { status: 401 });

  const user = await database().prepare(
    `SELECT t.user_id, u.plan, u.status, u.email_verified_at
     FROM operational_access_tokens t JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = ? AND t.revoked_at IS NULL AND t.expires_at > CURRENT_TIMESTAMP`,
  ).bind(await hashToken(rawToken)).first<OperationalUser>();
  if (!user || user.status !== "active" || !user.email_verified_at) return Response.json({ error: "Acesso operacional expirado." }, { status: 401 });

  const body = await request.json().catch(() => null) as { reservationId?: string; deliveredResults?: number } | null;
  const reservationId = String(body?.reservationId ?? "");
  const delivered = Math.max(0, Math.floor(Number(body?.deliveredResults) || 0));
  if (!/^[0-9a-f-]{36}$/i.test(reservationId)) return Response.json({ error: "Reserva inválida." }, { status: 400 });

  const settled = await database().prepare(
    `UPDATE usage_events
     SET quantity = MIN(quantity, ?), settled_at = COALESCE(settled_at, CURRENT_TIMESTAMP)
     WHERE id = ? AND correlation_id = ? AND user_id = ? AND action = 'search' AND settled_at IS NULL
     RETURNING quantity, source`,
  ).bind(delivered, reservationId, reservationId, user.user_id).first<{ quantity: number; source: string | null }>();
  if (!settled) return Response.json({ error: "Reserva não encontrada." }, { status: 404 });

  const policy = planEntitlements[user.plan];
  const windowStart = usageWindowStart(user.plan);
  const used = await database().prepare(
    "SELECT COALESCE(SUM(quantity), 0) AS total FROM usage_events WHERE user_id = ? AND action = 'search' AND datetime(created_at) >= datetime(?)",
  ).bind(user.user_id, windowStart).first<{ total: number }>();
  await writeAuditEvent({
    action: "operational.search_settled",
    actorUserId: user.user_id,
    targetUserId: user.user_id,
    metadata: { source: settled.source ?? "unknown", eventId: reservationId, deliveredLeads: settled.quantity },
  });
  return Response.json({
    settled: true,
    deliveredResults: settled.quantity,
    remaining: Math.max(0, policy.leadLimit - (used?.total ?? policy.leadLimit)),
    leadLimit: policy.leadLimit,
    period: policy.period,
    plan: user.plan,
  }, { headers: { "Cache-Control": "no-store" } });
}
