import { AccountActionForm } from "@/app/components/account-action-form";

export default function ResendVerificationPage() {
  return <main className="auth-page"><section className="auth-panel"><a className="brand" href="/"><span className="brand-mark">P</span><span>PROSPECTA WORBITA</span></a><div className="auth-copy"><p className="eyebrow"><span /> Confirmação de acesso</p><h1>Reenvie a verificação.</h1><p>Se sua conta estiver pendente, enviaremos um novo link válido por 24 horas.</p></div><AccountActionForm mode="resend" /><p className="auth-switch"><a href="/login">Voltar ao login</a></p></section><aside className="auth-aside"><div><span>PRIVACIDADE</span><strong>A resposta não revela se um endereço está cadastrado.</strong></div></aside></main>;
}
