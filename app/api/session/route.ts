import { currentUser, database, planLimits } from "@/app/lib/auth";

export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ authenticated: false }, { status: 401, headers: { "Cache-Control": "no-store" } });
  const usage = await database().prepare("SELECT COUNT(*) AS total FROM usage_events WHERE user_id = ? AND action = 'search'").bind(user.id).first<{ total: number }>();
  const limits = planLimits[user.plan];
  return Response.json({ authenticated: true, user, usage: { searches: usage?.total ?? 0, remaining: Math.max(0, limits.searches - (usage?.total ?? 0)) }, limits }, { headers: { "Cache-Control": "no-store" } });
}

