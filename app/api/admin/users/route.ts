import { database, requireAdmin, type AccountStatus, type Plan } from "@/app/lib/auth";
import { requireSameOrigin, writeAuditEvent } from "@/app/lib/security";

const plans: Plan[] = ["trial", "essential", "growth", "scale"];
const statuses: AccountStatus[] = ["active", "suspended", "cancelled", "deletion_requested"];

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: Plan;
  role: string;
  status: AccountStatus;
  email_verified_at: string | null;
  trial_ends_at: string;
  created_at: string;
  active_sessions: number;
  usage_events: number;
};

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: "Acesso administrativo necessário." }, { status: 403 });
  const url = new URL(request.url);
  const query = `%${(url.searchParams.get("q") ?? "").trim().slice(0, 80)}%`;
  const result = await database().prepare(
    `SELECT u.id, u.name, u.email, u.company, u.plan, u.role, u.status, u.email_verified_at, u.trial_ends_at, u.created_at,
       (SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id AND s.revoked_at IS NULL AND s.expires_at > CURRENT_TIMESTAMP) AS active_sessions,
       (SELECT COUNT(*) FROM usage_events e WHERE e.user_id = u.id) AS usage_events
     FROM users u WHERE u.name LIKE ? OR u.email LIKE ? OR u.company LIKE ?
     ORDER BY u.created_at DESC LIMIT 100`,
  ).bind(query, query, query).all<AdminUserRow>();
  return Response.json({ users: result.results }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: "Acesso administrativo necessário." }, { status: 403 });
  const body = await request.json().catch(() => null) as { userId?: string; plan?: Plan; status?: AccountStatus; reason?: string } | null;
  if (!body?.userId) return Response.json({ error: "Usuário não informado." }, { status: 400 });
  if (body.plan && !plans.includes(body.plan)) return Response.json({ error: "Plano inválido." }, { status: 400 });
  if (body.status && !statuses.includes(body.status)) return Response.json({ error: "Estado inválido." }, { status: 400 });

  const target = await database().prepare("SELECT id, role, plan, status FROM users WHERE id = ?").bind(body.userId).first<{ id: string; role: string; plan: Plan; status: AccountStatus }>();
  if (!target) return Response.json({ error: "Usuário não encontrado." }, { status: 404 });
  if (target.role === "admin" && body.status && body.status !== "active") return Response.json({ error: "A conta administradora não pode ser suspensa por este painel." }, { status: 409 });

  const nextPlan = body.plan ?? target.plan;
  const nextStatus = body.status ?? target.status;
  const reason = nextStatus === "suspended" ? (body.reason ?? "").trim().slice(0, 300) : null;
  await database().batch([
    database().prepare("UPDATE users SET plan = ?, status = ?, suspended_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(nextPlan, nextStatus, reason, target.id),
    ...(nextStatus === "active" ? [] : [database().prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE user_id = ? AND revoked_at IS NULL").bind(target.id)]),
  ]);
  await writeAuditEvent({ action: "admin.user_updated", actorUserId: admin.id, targetUserId: target.id, metadata: { fromPlan: target.plan, toPlan: nextPlan, fromStatus: target.status, toStatus: nextStatus } });
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
