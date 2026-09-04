import { AuthForm } from "@/app/components/auth-form";

export default function SignupPage() {
  return <main className="auth-page"><section className="auth-panel"><a className="brand" href="/"><span className="brand-mark">P</span><span>PROSPECTA</span></a><div className="auth-copy"><p className="eyebrow"><span /> Teste grátis controlado</p><h1>Conheça o fluxo antes de contratar.</h1><p>Crie seu workspace e realize até 3 pesquisas com uma amostra limitada de resultados.</p></div><AuthForm mode="register" /><p className="auth-switch">Já possui conta? <a href="/login">Fazer login</a></p></section><aside className="auth-aside signup-aside"><div><span>INCLUÍDO NO TESTE</span><ul><li>7 dias de acesso</li><li>3 pesquisas no total</li><li>Até 5 resultados por pesquisa</li><li>Sem exportação ou automações</li></ul></div></aside></main>;
}

