"use client";

import { FormEvent, useState } from "react";

type Mode = "forgot" | "resend" | "verify" | "reset";

const routes: Record<Mode, string> = {
  forgot: "/api/auth/forgot-password",
  resend: "/api/auth/resend-verification",
  verify: "/api/auth/verify-email",
  reset: "/api/auth/reset-password",
};

export function AccountActionForm({ mode }: { mode: Mode }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("confirmation") ?? "");
    if (mode === "reset" && password !== confirmation) {
      setError("As senhas não coincidem.");
      setPending(false);
      return;
    }
    const payload = Object.fromEntries(form.entries());
    if (mode === "verify" || mode === "reset") payload.token = new URLSearchParams(window.location.search).get("token") ?? "";
    const response = await fetch(routes[mode], { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json() as { error?: string; message?: string };
    if (!response.ok) setError(data.error ?? "Não foi possível concluir.");
    else setMessage(data.message ?? (mode === "verify" ? "E-mail confirmado. Você já pode entrar." : mode === "reset" ? "Senha redefinida. Entre novamente." : "Confira seu e-mail."));
    setPending(false);
  }

  return <form className="auth-form" onSubmit={submit}>
    {mode === "forgot" || mode === "resend" ? <label>E-mail<input name="email" type="email" autoComplete="email" required /></label> : null}
    {mode === "reset" ? <><label>Nova senha<input name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /></label><label>Confirmar nova senha<input name="confirmation" type="password" autoComplete="new-password" minLength={10} maxLength={128} required /></label></> : null}
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {message ? <p className="form-notice" role="status">{message} <a href="/login">Ir para o login</a></p> : null}
    <button className="button button-primary auth-submit" disabled={pending}>{pending ? "Aguarde…" : mode === "verify" ? "Confirmar e-mail" : mode === "reset" ? "Salvar nova senha" : mode === "resend" ? "Reenviar confirmação" : "Enviar instruções"}</button>
  </form>;
}
