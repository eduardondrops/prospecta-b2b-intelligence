import { currentUser, database } from "@/app/lib/auth";
import { planEntitlements, usageWindowStart } from "@/app/lib/entitlements";

export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ authenticated: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const limits = planEntitlements[user.plan];
  const usage = await database().prepare("SELECT COALESCE(SUM(quantity), 0) AS total FROM usage_events WHERE user_id = ? AND action = 'search' AND datetime(created_at) >= datetime(?)")
    .bind(user.id, usageWindowStart(user.plan)).first<{ total: number }>();
  return Response.json({
    authenticated: true,
    user,
    usage: { leads: usage?.total ?? 0, remaining: Math.max(0, limits.leadLimit - (usage?.total ?? 0)) },
    limits,
  }, { headers: { "Cache-Control": "no-store" } });
}
