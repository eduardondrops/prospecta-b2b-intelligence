"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Company } from "@/app/data/companies";

type SessionData = {
  user: { name: string; company: string; plan: string; trialEndsAt: string };
  usage: { searches: number; remaining: number };
  limits: { searches: number; results: number; export: boolean; enrichment: boolean; automation: boolean };
};

export function Workspace() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [results, setResults] = useState<Company[]>([]);
  const [message, setMessage] = useState("Faça uma pesquisa para iniciar.");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    fetch("/api/session", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) { router.replace("/login"); return; }
      const data = await response.json() as SessionData;
      setSession(data);
    });
  }, [router]);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams({ q: String(form.get("q") ?? ""), segment: String(form.get("segment") ?? "All") });
    const response = await fetch(`/api/prospects?${params}`, { cache: "no-store" });
    const data = await response.json() as { results?: Company[]; remaining?: number; error?: string };
    if (!response.ok) { setMessage(data.error ?? "Pesquisa indisponível."); setPending(false); return; }
    setResults(data.results ?? []);
    setMessage(`${data.results?.length ?? 0} resultados · ${data.remaining ?? 0} pesquisas restantes`);
    setSession((current) => current ? { ...current, usage: { searches: current.usage.searches + 1, remaining: data.remaining ?? 0 } } : current);
    setPending(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  if (!session) return <main className="workspace-loading"><span className="brand-mark">P</span><p>Preparando seu workspace…</p></main>;

  return <main className="operational-shell"><aside className="operational-sidebar"><a className="mini-brand" href="/"><span>P</span><strong>Prospecta</strong></a><nav><a className="active" href="#search">⌁ Pesquisa</a><a href="#shortlist">◇ Lista salva</a><button disabled>↻ Automações <small>Growth</small></button><button disabled>⇩ Exportações <small>Essential</small></button></nav><div className="account-card"><span>{session.user.plan === "trial" ? "TESTE GRÁTIS" : session.user.plan.toUpperCase()}</span><strong>{session.user.name}</strong><small>{session.user.company || "Workspace individual"}</small><button onClick={logout}>Sair</button></div></aside><section className="operational-content"><header><div><p>WORKSPACE / PROSPECÇÃO</p><h1>Pesquisa comercial</h1></div><div className="usage-pill"><span>{session.usage.remaining}</span> pesquisas restantes</div></header><div className="trial-notice"><strong>Teste controlado:</strong> até {session.limits.results} resultados por pesquisa. Exportação, enriquecimento e automações permanecem bloqueados.</div><form className="operational-search" onSubmit={search}><label><span>Empresa ou localização</span><input name="q" placeholder="Ex.: logística Fortaleza" /></label><label><span>Segmento</span><select name="segment"><option value="All">Todos</option><option>Logistics</option><option>Healthcare</option><option>Retail</option><option>Technology</option><option>Construction</option></select></label><button className="button button-primary" disabled={pending || session.usage.remaining === 0}>{pending ? "Pesquisando…" : "Pesquisar"}</button></form><div className="workspace-status">{message}</div><div className="workspace-results">{results.map((company) => <article key={company.id}><div><span>{company.segment}</span><h2>{company.name}</h2><p>{company.city}, {company.state}</p></div><div className="result-score"><small>FIT SCORE</small><strong>{company.score}</strong></div><button type="button">Adicionar à lista</button></article>)}</div>{session.usage.remaining === 0 ? <div className="upgrade-wall"><span>LIMITE DO TESTE ATINGIDO</span><h2>Pronto para ampliar sua operação?</h2><p>Compare os planos para liberar mais pesquisas, exportações e automações.</p><a className="button button-primary" href="/#planos">Ver planos</a></div> : null}</section></main>;
}

