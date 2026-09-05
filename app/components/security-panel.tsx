"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Session = { id: string; created_at: string; last_seen_at: string | null; expires_at: string; current: boolean };

export function SecurityPanel() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/account/sessions", { cache: "no-store" });
    if (response.status === 401) { router.replace("/login"); return; }
    const data = await response.json() as { sessions?: Session[] };
    setSessions(data.sessions ?? []);
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  async function revoke(sessionId?: string, all = false) {
    const response = await fetch("/api/account/sessions", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, all }) });
    const data = await response.json() as { error?: string; signedOut?: boolean };
    if (!response.ok) { setMessage(data.error ?? "Não foi possível encerrar a sessão."); return; }
    if (data.signedOut) { router.replace("/login"); return; }
    setMessage("Sessão encerrada.");
    await load();
  }

  async function requestDeletion() {
    if (!window.confirm("Solicitar exclusão encerra todas as sessões e bloqueia o acesso enquanto o pedido é analisado. Continuar?")) return;
    const response = await fetch("/api/account/deletion-request", { method: "POST" });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setMessage(data.error ?? "Não foi possível registrar a solicitação."); return; }
    router.replace("/");
  }

  return <main className="security-page"><a className="brand" href="/"><span className="brand-mark">P</span><span>PROSPECTA WORBITA</span></a><section><p className="eyebrow"><span /> Segurança da conta</p><h1>Sessões ativas</h1><p>Encerre acessos que você não reconhece. Uma troca de senha encerra todas as sessões automaticamente.</p>{message ? <p className="form-notice">{message}</p> : null}<div className="session-list">{sessions.map((session) => <article key={session.id}><div><strong>{session.current ? "Esta sessão" : "Sessão ativa"}</strong><small>Criada em {new Date(session.created_at).toLocaleString("pt-BR")} · expira em {new Date(session.expires_at).toLocaleString("pt-BR")}</small></div><button type="button" onClick={() => void revoke(session.id)}>{session.current ? "Sair" : "Encerrar"}</button></article>)}</div><div className="security-actions"><button className="button button-secondary" onClick={() => void revoke(undefined, true)}>Encerrar todas as sessões</button><a className="button button-secondary" href="/esqueci-a-senha">Trocar minha senha</a></div><div className="danger-zone"><h2>Solicitar exclusão</h2><p>O pedido bloqueia o acesso e entra em análise de retenção e obrigações aplicáveis.</p><button type="button" onClick={() => void requestDeletion()}>Solicitar exclusão da conta</button></div></section></main>;
}
