import { AuthForm } from "@/app/components/auth-form";
import { AccessFlowDiagram } from "@/app/components/access-flow-diagram";
import Image from "next/image";

export default function LoginPage() {
  return <main className="auth-page login-page"><section className="auth-panel"><a className="login-brand" href="/" aria-label="Prospecta Worbita — página inicial"><Image src="/brand/prospecta-logo.svg" alt="Prospecta Worbita" width={286} height={66} priority /></a><div className="auth-copy"><p className="eyebrow"><span /> Área segura</p><h1>Bem-vindo de volta.</h1><p>Acesse sua área de prospecção e continue sua operação comercial.</p></div><AuthForm mode="login" /><p className="auth-switch">Ainda não tem conta? <a href="/inscreva-se">Comece o teste grátis</a></p></section><aside className="auth-aside login-aside"><div><span>CONTROLE DE ACESSO</span><strong>Seu pipeline comercial em um ambiente isolado.</strong><AccessFlowDiagram /><p>Sessões protegidas, limites por plano e trilha de consumo desde o primeiro acesso.</p></div></aside></main>;
}
