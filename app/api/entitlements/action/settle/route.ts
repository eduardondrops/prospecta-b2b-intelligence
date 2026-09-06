import { env } from "cloudflare:workers";
import { database, hashToken, type Plan } from "@/app/lib/auth";
import { planEntitlements, usageWindowStart } from "@/app/lib/entitlements";
import { writeAuditEvent } from "@/app/lib/security";

type OperationalUser = { user_id: string; plan: Plan; status: string; email_verified_at: string | null };

async function fixedHash(value: string) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
}

function equalDigest(left: ArrayBuffer, right: ArrayBuffer) {
  const a = new Uint8Array(left);
  const b = new Uint8Array(right);
  let difference = a.length ^ b.length;
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    difference |= (a[index] ?? 0) ^ (b[index] ?? 0);
  }
  return difference === 0;
}

async function authenticate(request: Request, userId: string) {
  const authorization = request.headers.get("authorization") ?? "";
  const rawToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (rawToken.length >= 32) {
    return database().prepare(
      `SELECT t.user_id, u.plan, u.status, u.email_verified_at
       FROM operational_access_tokens t JOIN users u ON u.id = t.user_id
       WHERE t.token_hash = ? AND t.revoked_at IS NULL AND t.expires_at > CURRENT_TIMESTAMP`,
    ).bind(await hashToken(rawToken)).first<OperationalUser>();
  }
  const provided = request.headers.get("x-service-token") ?? "";
  const expected = (env as Cloudflare.Env & { PROSPECTA_SERVICE_TOKEN?: string }).PROSPECTA_SERVICE_TOKEN ?? "";
  if (!provided || !expected || !userId) return null;
  const [left, right] = await Promise.all([fixedHash(provided), fixedHash(expected)]);
  if (!equalDigest(left, right)) return null;
  return database().prepare(
    "SELECT id AS user_id, plan, status, email_verified_at FROM users WHERE id = ?",
  ).bind(userId).first<OperationalUser>();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { reservationId?: unknown; deliveredResults?: unknown; userId?: unknown } | null;
  const reservationId = String(body?.reservationId ?? "");
  const userId = String(body?.userId ?? "");
  const delivered = Math.max(0, Math.floor(Number(body?.deliveredResults) || 0));
  if (!/^[0-9a-f-]{36}$/i.test(reservationId)) return Response.json({ error: "Reserva inválida." }, { status: 400 });
  const user = await authenticate(request, userId);
  if (!user || !user.email_verified_at) return Response.json({ error: "Acesso operacional inválido." }, { status: 401 });

  const settled = await database().prepare(
    `UPDATE usage_events SET quantity = MIN(reserved_quantity, ?), settled_at = CURRENT_TIMESTAMP
     WHERE id = ? AND correlation_id = ? AND user_id = ? AND action = 'campaign'
     RETURNING quantity`,
  ).bind(delivered, reservationId, reservationId, user.user_id).first<{ quantity: number }>();
  if (!settled) return Response.json({ error: "Reserva não encontrada." }, { status: 404 });
  const policy = planEntitlements[user.plan];
  const used = await database().prepare(
    "SELECT COALESCE(SUM(quantity), 0) AS total FROM usage_events WHERE user_id = ? AND action = 'campaign' AND datetime(created_at) >= datetime(?)",
  ).bind(user.user_id, usageWindowStart(user.plan)).first<{ total: number }>();
  await writeAuditEvent({ action: "operational.campaign_settled", actorUserId: user.user_id, targetUserId: user.user_id, metadata: { reservationId, delivered: settled.quantity } });
  return Response.json({ settled: true, deliveredResults: settled.quantity, remaining: Math.max(0, policy.campaignDailyLimit - (used?.total ?? 0)) }, { headers: { "Cache-Control": "no-store" } });
}
