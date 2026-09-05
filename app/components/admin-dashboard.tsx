"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Plan = "trial" | "essential" | "growth" | "scale";
type Status = "active" | "suspended" | "cancelled" | "deletion_requested";
type User = { id: string; name: string; email: string; company: string; plan: Plan; role: string; status: Status; email_verified_at: string | null; created_at: string; active_sessions: number; usage_events: number };
type Audit = { id: string; action: string; actor_email: string | null; target_email: string | null; created_at: string };

export function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("Carregando usuários…");

  const load = useCallback(async (search = "") => {
    const [usersResponse, auditResponse] = await Promise.all([
      fetch(`/api/admin/users?q=${encodeURIComponent(search)}`, { cache: "no-store" }),
      fetch("/api/admin/audit", { cache: "no-store" }),
    ]);
    if (usersResponse.status === 403) { router.replace("/workspace"); return; }
    const usersData = await usersResponse.json() as { users?: User[]; error?: string };
    const auditData = await auditResponse.json() as { events?: Audit[] };
    setUsers(usersData.users ?? []);
    setAudits(auditData.events ?? []);
    setMessage(usersData.error ?? `${usersData.users?.length ?? 0} contas encontradas`);
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  async function search(event: FormEvent) {
    event.preventDefault();
    await load(query);
  }

  async function update(user: User, plan: Plan, status: Status) {
    const reason = status === "suspended" ? window.prompt("Motivo da suspensão:") ?? "" : "";
    if (status === "suspended" && !reason) return;
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, plan, status, reason }) });
    const data = await response.json() as { error?: string };
    setMessage(response.ok ? "Conta atualizada e alteração auditada." : data.error ?? "Não foi possível atualizar.");
    if (response.ok) await load(query);
  }

  return <main className="admin-shell"><header className="admin-header"><a className="brand" href="/"><span className="brand-mark">P</span><span>PROSPECTA WORBITA</span></a><div><a href="/conta/seguranca">Minha segurança</a><a href="/workspace">Workspace</a></div></header><section className="admin-content"><div className="admin-title"><div><p className="eyebrow"><span /> Administração</p><h1>Contas e permissões</h1></div><p>Planos, estados e sessões são aplicados no servidor e registrados na auditoria.</p></div><form className="admin-search" onSubmit={search}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar nome, empresa ou e-mail" /><button className="button button-primary">Buscar</button></form><p className="workspace-status">{message}</p><div className="admin-table"><table><thead><tr><th>Conta</th><th>Verificação</th><th>Plano</th><th>Estado</th><th>Sessões</th><th>Uso</th><th>Ação</th></tr></thead><tbody>{users.map((user) => <AdminUserRow key={user.id} user={user} onSave={update} />)}</tbody></table></div><section className="audit-panel"><h2>Auditoria recente</h2>{audits.slice(0, 20).map((audit) => <article key={audit.id}><strong>{audit.action}</strong><span>{audit.actor_email ?? "sistema"} → {audit.target_email ?? "—"}</span><time>{new Date(audit.created_at).toLocaleString("pt-BR")}</time></article>)}</section></section></main>;
}

function AdminUserRow({ user, onSave }: { user: User; onSave: (user: User, plan: Plan, status: Status) => Promise<void> }) {
  const [plan, setPlan] = useState(user.plan);
  const [status, setStatus] = useState(user.status);
  return <tr><td><strong>{user.name}</strong><small>{user.email}<br />{user.company || "Conta individual"}</small></td><td>{user.email_verified_at ? "Confirmado" : "Pendente"}</td><td><select value={plan} onChange={(event) => setPlan(event.target.value as Plan)}><option value="trial">Trial</option><option value="essential">Essential</option><option value="growth">Growth</option><option value="scale">Scale</option></select></td><td><select value={status} onChange={(event) => setStatus(event.target.value as Status)}><option value="active">Ativa</option><option value="suspended">Suspensa</option><option value="cancelled">Cancelada</option><option value="deletion_requested">Exclusão solicitada</option></select></td><td>{user.active_sessions}</td><td>{user.usage_events}</td><td><button type="button" onClick={() => void onSave(user, plan, status)}>Salvar</button></td></tr>;
}
