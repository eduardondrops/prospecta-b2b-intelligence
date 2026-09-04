"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) {
      setError(data.error ?? "Não foi possível concluir. Tente novamente.");
      setPending(false);
      return;
    }
    router.push("/workspace");
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {isRegister ? <><label>Nome completo<input name="name" autoComplete="name" required minLength={2} /></label><label>Empresa <span>(opcional)</span><input name="company" autoComplete="organization" /></label></> : null}
      <label>E-mail profissional<input name="email" type="email" autoComplete="email" required /></label>
      <label>Senha<input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={10} /></label>
      {isRegister ? <p className="form-hint">Mínimo de 10 caracteres. O teste dura 7 dias e permite somente 3 pesquisas.</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button button-primary auth-submit" type="submit" disabled={pending}>{pending ? "Aguarde…" : isRegister ? "Criar conta grátis" : "Entrar no Prospecta"}</button>
    </form>
  );
}

