import { AuthForm } from "@/app/components/auth-form";

export default function SignupPage() {
  return <main className="auth-page"><section className="auth-panel"><a className="brand" href="/"><span className="brand-mark">P</span><span>PROSPECTA WORBITA</span></a><div className="auth-copy"><p className="eyebrow"><span /> Teste grátis controlado</p><h1>Conheça o fluxo antes de contratar.</h1><p>Crie sua conta, confirme o e-mail e experimente uma amostra limitada da prospecção.</p></div><AuthForm mode="register" /><p className="auth-switch">Já possui conta? <a href="/login">Fazer login</a></p></section><aside className="auth-aside signup-aside"><div><span>POLÍTICA DO TESTE</span><ul><li>7 dias de acesso</li><li>Até 15 leads no total</li><li>1 WhatsApp previsto</li><li>Confirmação antes de disparar</li></ul></div></aside></main>;
}
