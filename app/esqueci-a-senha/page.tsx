import { AccountActionForm } from "@/app/components/account-action-form";

export default function ForgotPasswordPage() {
  return <main className="auth-page"><section className="auth-panel"><a className="brand" href="/"><span className="brand-mark">P</span><span>PROSPECTA WORBITA</span></a><div className="auth-copy"><p className="eyebrow"><span /> Recuperação segura</p><h1>Redefina sua senha.</h1><p>Enviaremos um link de uso único, válido por 30 minutos.</p></div><AccountActionForm mode="forgot" /><p className="auth-switch"><a href="/login">Voltar ao login</a></p></section><aside className="auth-aside"><div><span>PROTEÇÃO DE CONTA</span><strong>Links curtos e sessões revogadas após a troca.</strong></div></aside></main>;
}
