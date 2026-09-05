import { AccountActionForm } from "@/app/components/account-action-form";

export default function ResetPasswordPage() {
  return <main className="auth-page"><section className="auth-panel"><a className="brand" href="/"><span className="brand-mark">P</span><span>PROSPECTA WORBITA</span></a><div className="auth-copy"><p className="eyebrow"><span /> Nova credencial</p><h1>Escolha uma nova senha.</h1><p>Após a alteração, todas as sessões anteriores serão encerradas.</p></div><AccountActionForm mode="reset" /><p className="auth-switch"><a href="/login">Voltar ao login</a></p></section><aside className="auth-aside"><div><span>SEGURANÇA</span><strong>Use uma senha exclusiva com pelo menos 10 caracteres.</strong></div></aside></main>;
}
