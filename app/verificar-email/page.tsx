import { AccountActionForm } from "@/app/components/account-action-form";

export default function VerifyEmailPage() {
  return <main className="auth-page"><section className="auth-panel"><a className="brand" href="/"><span className="brand-mark">P</span><span>PROSPECTA WORBITA</span></a><div className="auth-copy"><p className="eyebrow"><span /> Verificação</p><h1>Confirme seu e-mail.</h1><p>Esta etapa protege sua identidade e ativa o acesso à conta.</p></div><AccountActionForm mode="verify" /><p className="auth-switch"><a href="/reenviar-verificacao">Solicitar outro link</a></p></section><aside className="auth-aside"><div><span>LINK DE USO ÚNICO</span><strong>A confirmação expira e não expõe sua senha.</strong></div></aside></main>;
}
