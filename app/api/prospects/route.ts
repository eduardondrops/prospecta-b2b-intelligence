import { companies } from "@/app/data/companies";
import { currentUser, database } from "@/app/lib/auth";
import { planEntitlements, usageWindowStart } from "@/app/lib/entitlements";

export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "Faça login para pesquisar." }, { status: 401 });
  if (user.plan === "trial" && new Date(user.trialEndsAt).getTime() < Date.now()) return Response.json({ error: "Seu teste grátis terminou.", code: "TRIAL_EXPIRED" }, { status: 403 });

  const limits = planEntitlements[user.plan];
  const windowStart = usageWindowStart(user.plan);
  const usage = await database().prepare("SELECT COALESCE(SUM(quantity), 0) AS total FROM usage_events WHERE user_id = ? AND action = 'search' AND datetime(created_at) >= datetime(?)").bind(user.id, windowStart).first<{ total: number }>();
  const used = usage?.total ?? 0;
  if (used >= limits.leadLimit) return Response.json({ error: "Limite de leads atingido.", code: "LIMIT_REACHED", remaining: 0 }, { status: 429 });

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().toLocaleLowerCase("pt-BR");
  const segment = url.searchParams.get("segment") ?? "All";
  const results = companies.filter((company) => {
    const searchTarget = `${company.name} ${company.city} ${company.state}`.toLocaleLowerCase("pt-BR");
    return (!query || searchTarget.includes(query)) && (segment === "All" || company.segment === segment);
  }).slice(0, Math.min(limits.maxResultsPerSearch, limits.leadLimit - used));

  await database().prepare("INSERT INTO usage_events (id, user_id, action, quantity, source, settled_at) VALUES (?, ?, 'search', ?, 'synthetic', CURRENT_TIMESTAMP)")
    .bind(crypto.randomUUID(), user.id, results.length).run();
  return Response.json({ results, remaining: Math.max(0, limits.leadLimit - used - results.length), limits }, { headers: { "Cache-Control": "no-store" } });
}
