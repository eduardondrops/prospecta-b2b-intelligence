import { companies } from "@/app/data/companies";
import { currentUser, database, planLimits } from "@/app/lib/auth";

export async function GET(request: Request) {
  const user = await currentUser(request);
  if (!user) return Response.json({ error: "Faça login para pesquisar." }, { status: 401 });
  if (user.plan === "trial" && new Date(user.trialEndsAt).getTime() < Date.now()) return Response.json({ error: "Seu teste grátis terminou.", code: "TRIAL_EXPIRED" }, { status: 403 });

  const limits = planLimits[user.plan];
  const usage = await database().prepare("SELECT COUNT(*) AS total FROM usage_events WHERE user_id = ? AND action = 'search'").bind(user.id).first<{ total: number }>();
  const used = usage?.total ?? 0;
  if (used >= limits.searches) return Response.json({ error: "Limite de pesquisas atingido.", code: "LIMIT_REACHED", remaining: 0 }, { status: 429 });

  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().toLocaleLowerCase("pt-BR");
  const segment = url.searchParams.get("segment") ?? "All";
  const results = companies.filter((company) => {
    const searchTarget = `${company.name} ${company.city} ${company.state}`.toLocaleLowerCase("pt-BR");
    return (!query || searchTarget.includes(query)) && (segment === "All" || company.segment === segment);
  }).slice(0, limits.results);

  await database().prepare("INSERT INTO usage_events (id, user_id, action) VALUES (?, ?, 'search')").bind(crypto.randomUUID(), user.id).run();
  return Response.json({ results, remaining: Math.max(0, limits.searches - used - 1), limits }, { headers: { "Cache-Control": "no-store" } });
}

