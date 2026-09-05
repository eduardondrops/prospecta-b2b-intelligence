"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);
  const isRegister = mode === "register";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const payload: Record<string, FormDataEntryValue | boolean> = Object.fromEntries(form.entries());
    payload.acceptedTerms = form.get("acceptedTerms") === "on";
    try {
      const response = await fetch(`/api/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const contentType = response.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json")
        ? await response.json() as { error?: string; verificationRequired?: boolean; emailSent?: boolean }
        : { error: await response.text() };
      if (!response.ok) {
        setError(data.error || "Não foi possível concluir. Tente novamente.");
        return;
      }
      if (isRegister && data.verificationRequired) {
        setNotice(data.emailSent === false
          ? "Conta criada. O envio de e-mail ainda não está configurado; solicite um novo link após a ativação do serviço de e-mail."
          : "Conta criada. Confira seu e-mail para confirmar o acesso.");
        event.currentTarget.reset();
        return;
      }
      router.push("/workspace");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao Prospecta. Verifique a publicação do serviço e tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {isRegister ? <><label>Nome completo<input name="name" autoComplete="name" required minLength={2} maxLength={80} /></label><label>Empresa <span>(opcional)</span><input name="company" autoComplete="organization" maxLength={120} /></label></> : null}
      <label>E-mail profissional<input name="email" type="email" autoComplete="email" required /></label>
      <label>Senha<input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={10} maxLength={128} /></label>
      <label className="honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      {isRegister ? <>
        <p className="form-hint">Mínimo de 10 caracteres. O teste dura 7 dias e libera até 15 leads no total.</p>
        <label className="consent-field"><input name="acceptedTerms" type="checkbox" required /><span>Li e aceito os <a href="/termos" target="_blank">Termos de Uso</a> e a <a href="/privacidade" target="_blank">Política de Privacidade</a>.</span></label>
      </> : <div className="auth-links"><a href="/esqueci-a-senha">Esqueci minha senha</a><a href="/reenviar-verificacao">Reenviar confirmação</a></div>}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {notice ? <p className="form-notice" role="status">{notice}</p> : null}
      <button className="button button-primary auth-submit" type="submit" disabled={pending}>{pending ? "Aguarde…" : isRegister ? "Criar conta grátis" : "Entrar no Prospecta"}</button>
    </form>
  );
}
