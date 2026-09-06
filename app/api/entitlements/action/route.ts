import { database, hashToken, type Plan } from "@/app/lib/auth";
import { planEntitlements, usageWindowStart } from "@/app/lib/entitlements";
import { writeAuditEvent } from "@/app/lib/security";

type OperationalUser = {
  user_id: string;
  plan: Plan;
  trial_ends_at: string;
  status: string;
  email_verified_at: string | null;
};

const actions = ["save", "export", "campaign", "automation", "whatsapp"] as const;
type Action = (typeof actions)[number];

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const rawToken = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (rawToken.length < 32) return Response.json({ error: "Acesso operacional inválido." }, { status: 401 });

  const user = await database().prepare(
    `SELECT t.user_id, u.plan, u.trial_ends_at, u.status, u.email_verified_at
     FROM operational_access_tokens t JOIN users u ON u.id = t.user_id
     WHERE t.token_hash = ? AND t.revoked_at IS NULL AND t.expires_at > CURRENT_TIMESTAMP`,
  ).bind(await hashToken(rawToken)).first<OperationalUser>();
  if (!user || user.status !== "active" || !user.email_verified_at) return Response.json({ error: "Acesso operacional expirado." }, { status: 401 });
  if (user.plan === "trial" && new Date(user.trial_ends_at).getTime() < Date.now()) return Response.json({ error: "Seu teste grátis terminou.", code: "TRIAL_EXPIRED" }, { status: 403 });

  const body = await request.json().catch(() => null) as { action?: unknown; requestedQuantity?: unknown; reserve?: unknown; inspect?: unknown } | null;
  const action = String(body?.action ?? "") as Action;
  if (!actions.includes(action)) return Response.json({ error: "Ação inválida." }, { status: 400 });

  const policy = planEntitlements[user.plan];
  const allowed = action === "whatsapp" ? policy.whatsappConnections !== 0 : Boolean(policy[action]);
  if (!allowed) return Response.json({ error: "Esta ação não está disponível no seu plano. Consulte as opções comerciais.", code: "FEATURE_BLOCKED", plan: user.plan, upgradeUrl: "https://prospectaworbita.site/#planos" }, { status: 403 });

  const requested = Math.max(0, Math.floor(Number(body?.requestedQuantity) || 0));
  const quantityLimit = action === "campaign"
    ? policy.campaignTotalLimit
    : action === "whatsapp"
      ? policy.whatsappConnections
      : policy.leadLimit;
  let allowedQuantity = quantityLimit == null || requested === 0 ? requested : Math.min(requested, quantityLimit);
  let reservationId: string | null = null;
  const windowStart = usageWindowStart(user.plan);
  const campaignUsage = await database().prepare(
    "SELECT COALESCE(SUM(quantity), 0) AS total FROM usage_events WHERE user_id = ? AND action = 'campaign' AND datetime(created_at) >= datetime(?)",
  ).bind(user.user_id, windowStart).first<{ total: number }>();
  const campaignUsed = campaignUsage?.total ?? 0;
  const leadUsage = await database().prepare(
    "SELECT COALESCE(SUM(quantity), 0) AS total FROM usage_events WHERE user_id = ? AND action = 'search' AND datetime(created_at) >= datetime(?)",
  ).bind(user.user_id, windowStart).first<{ total: number }>();
  const leadsUsed = leadUsage?.total ?? 0;

  if (action === "whatsapp" && policy.whatsappConnections != null && requested > policy.whatsappConnections) {
    return Response.json({ error: `Seu plano permite até ${policy.whatsappConnections} conexão(ões) de WhatsApp. Consulte os planos para ampliar o limite.`, code: "WHATSAPP_LIMIT_REACHED", plan: user.plan, upgradeUrl: "https://prospectaworbita.site/#planos" }, { status: 429 });
  }

  if (action === "campaign" && body?.reserve === true && requested > 0) {
    reservationId = crypto.randomUUID();
    const reservation = await database().prepare(
      `WITH current_usage AS (
         SELECT COALESCE(SUM(quantity), 0) AS used FROM usage_events
         WHERE user_id = ? AND action = 'campaign' AND datetime(created_at) >= datetime(?)
       )
       INSERT INTO usage_events (id, user_id, action, quantity, reserved_quantity, source, correlation_id)
       SELECT ?, ?, 'campaign', MIN(?, MAX(0, ? - used)), MIN(?, MAX(0, ? - used)), 'whatsapp', ?
       FROM current_usage WHERE used < ?
       RETURNING quantity`,
    ).bind(
      user.user_id, windowStart, reservationId, user.user_id,
      requested, policy.campaignDailyLimit, requested, policy.campaignDailyLimit,
      reservationId, policy.campaignDailyLimit,
    ).first<{ quantity: number }>();
    allowedQuantity = reservation?.quantity ?? 0;
    if (!reservation || allowedQuantity === 0) {
      return Response.json({ error: "Limite de destinatários do período atingido. Consulte os planos para ampliar o limite.", code: "CAMPAIGN_LIMIT_REACHED", plan: user.plan, remaining: 0, upgradeUrl: "https://prospectaworbita.site/#planos" }, { status: 429 });
    }
  }

  if (body?.inspect !== true) {
    await writeAuditEvent({
      action: `operational.${action}_authorized`,
      actorUserId: user.user_id,
      targetUserId: user.user_id,
      metadata: { requestedQuantity: requested, allowedQuantity, plan: user.plan, reservationId },
    });
  }
  return Response.json({
    allowed: true,
    action,
    plan: user.plan,
    allowedQuantity,
    reservationId,
    leadLimit: policy.leadLimit,
    period: policy.period,
    campaignDailyLimit: policy.campaignDailyLimit,
    campaignTotalLimit: policy.campaignTotalLimit,
    whatsappConnections: policy.whatsappConnections,
    manualCampaignConfirmation: policy.manualCampaignConfirmation,
    campaignUsage: {
      used: campaignUsed + (reservationId ? allowedQuantity : 0),
      remaining: Math.max(0, policy.campaignDailyLimit - campaignUsed - (reservationId ? allowedQuantity : 0)),
    },
    leadUsage: {
      used: leadsUsed,
      remaining: Math.max(0, policy.leadLimit - leadsUsed),
      limit: policy.leadLimit,
    },
    upgradeUrl: "https://prospectaworbita.site/#planos",
  }, { headers: { "Cache-Control": "no-store" } });
}
