import { database, hashToken, type Plan } from "@/app/lib/auth";
import { planEntitlements } from "@/app/lib/entitlements";
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

  const body = await request.json().catch(() => null) as { action?: unknown; requestedQuantity?: unknown } | null;
  const action = String(body?.action ?? "") as Action;
  if (!actions.includes(action)) return Response.json({ error: "Ação inválida." }, { status: 400 });

  const policy = planEntitlements[user.plan];
  const allowed = action === "whatsapp" ? policy.whatsappConnections !== 0 : Boolean(policy[action]);
  if (!allowed) return Response.json({ error: "Esta ação não está disponível no seu plano.", code: "FEATURE_BLOCKED", plan: user.plan }, { status: 403 });

  const requested = Math.max(0, Math.floor(Number(body?.requestedQuantity) || 0));
  const quantityLimit = action === "campaign"
    ? policy.campaignTotalLimit
    : action === "whatsapp"
      ? policy.whatsappConnections
      : policy.leadLimit;
  const allowedQuantity = quantityLimit == null || requested === 0 ? requested : Math.min(requested, quantityLimit);

  await writeAuditEvent({
    action: `operational.${action}_authorized`,
    actorUserId: user.user_id,
    targetUserId: user.user_id,
    metadata: { requestedQuantity: requested, allowedQuantity, plan: user.plan },
  });
  return Response.json({
    allowed: true,
    action,
    plan: user.plan,
    allowedQuantity,
    leadLimit: policy.leadLimit,
    period: policy.period,
    campaignDailyLimit: policy.campaignDailyLimit,
    campaignTotalLimit: policy.campaignTotalLimit,
    whatsappConnections: policy.whatsappConnections,
    manualCampaignConfirmation: policy.manualCampaignConfirmation,
  }, { headers: { "Cache-Control": "no-store" } });
}
