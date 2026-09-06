import { env } from "cloudflare:workers";
import { database, type Plan } from "@/app/lib/auth";
import { planEntitlements, whatsappConnectionAllowed } from "@/app/lib/entitlements";
import { writeAuditEvent } from "@/app/lib/security";

type ServiceUser = {
  id: string;
  plan: Plan;
  trial_ends_at: string;
  status: string;
  email_verified_at: string | null;
};

const actions = ["save", "export", "campaign", "automation", "whatsapp"] as const;
type Action = (typeof actions)[number];

async function digest(value: string) {
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

async function validServiceToken(request: Request) {
  const provided = request.headers.get("x-service-token") ?? "";
  const expected = (env as Cloudflare.Env & { PROSPECTA_SERVICE_TOKEN?: string }).PROSPECTA_SERVICE_TOKEN ?? "";
  if (!provided || !expected) return false;
  const [left, right] = await Promise.all([digest(provided), digest(expected)]);
  return equalDigest(left, right);
}

export async function POST(request: Request) {
  if (!(await validServiceToken(request))) {
    return Response.json({ error: "Serviço não autorizado." }, { status: 401 });
  }
  const body = await request.json().catch(() => null) as { userId?: unknown; action?: unknown; requestedQuantity?: unknown } | null;
  const userId = String(body?.userId ?? "");
  const action = String(body?.action ?? "") as Action;
  const requested = Math.max(0, Math.floor(Number(body?.requestedQuantity) || 0));
  if (!userId || !actions.includes(action)) return Response.json({ error: "Ação inválida." }, { status: 400 });

  const user = await database().prepare(
    "SELECT id, plan, trial_ends_at, status, email_verified_at FROM users WHERE id = ?",
  ).bind(userId).first<ServiceUser>();
  if (!user || user.status !== "active" || !user.email_verified_at) {
    return Response.json({ error: "Conta operacional indisponível." }, { status: 403 });
  }
  if (user.plan === "trial" && new Date(user.trial_ends_at).getTime() < Date.now()) {
    return Response.json({ error: "Seu teste grátis terminou.", code: "TRIAL_EXPIRED" }, { status: 403 });
  }

  const policy = planEntitlements[user.plan];
  const featureAllowed = action === "whatsapp" ? policy.whatsappConnections !== 0 : Boolean(policy[action]);
  if (!featureAllowed) return Response.json({ error: "Esta ação não está disponível no plano.", code: "FEATURE_BLOCKED" }, { status: 403 });
  if (action === "whatsapp" && !whatsappConnectionAllowed(user.plan, requested)) {
    return Response.json({
      error: `Seu plano permite até ${policy.whatsappConnections} conexão(ões) de WhatsApp.`,
      code: "WHATSAPP_LIMIT_REACHED",
      plan: user.plan,
      upgradeUrl: "https://prospectaworbita.site/#planos",
    }, { status: 429 });
  }

  await writeAuditEvent({
    action: `operational.${action}_service_authorized`,
    actorUserId: user.id,
    targetUserId: user.id,
    metadata: { requestedQuantity: requested, plan: user.plan },
  });
  return Response.json({
    allowed: true,
    action,
    plan: user.plan,
    allowedQuantity: requested,
    leadLimit: policy.leadLimit,
    campaignDailyLimit: policy.campaignDailyLimit,
    whatsappConnections: policy.whatsappConnections,
    manualCampaignConfirmation: policy.manualCampaignConfirmation,
  }, { headers: { "Cache-Control": "no-store" } });
}
