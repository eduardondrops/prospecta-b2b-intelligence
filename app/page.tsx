import type { CSSProperties } from "react";
import Image from "next/image";
import { DashboardDemo } from "./components/dashboard-demo";
import { StackLogos } from "./components/stack-logos";

const capabilities = [
  { number: "01", title: "Pipelines de aquisição", copy: "Fluxos modulares coletam, normalizam e validam dados empresariais antes que eles cheguem à camada do produto." },
  { number: "02", title: "Motor de qualificação", copy: "Sinais determinísticos tornam cada pontuação explicável, auditável e útil para uma operação comercial." },
  { number: "03", title: "Entrega na borda", copy: "A plataforma utiliza Cloudflare Workers com um processo de publicação observável, seguro e repetível." },
];

const plans = [
  { name: "Essential", price: "R$ 49,90/mês", audience: "Para começar uma rotina comercial controlada", features: ["15 leads por dia", "1 WhatsApp conectado", "Todos os módulos com limites do plano", "Conta individual"], cta: "Começar no Essential", href: "/inscreva-se" },
  { name: "Growth", price: "R$ 97,90/mês", audience: "Para ampliar a prospecção e os disparos", features: ["45 leads por dia", "3 WhatsApps conectados", "Todos os módulos com limites do plano", "Conta individual"], cta: "Começar no Growth", href: "/inscreva-se", featured: true },
  { name: "Scale", price: "Sob consulta", audience: "Para demandas personalizadas ou empresariais", features: ["Limites definidos sob análise", "WhatsApps conforme a demanda", "Integrações e operação personalizadas", "Atendimento comercial"], cta: "Falar com o time comercial", href: "mailto:contato@prospectaworbita.site?subject=Interesse%20no%20plano%20Scale" },
];

export const revalidate = 300;

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand brand-logo" href="#top" aria-label="Página inicial do Prospecta Worbita">
          <Image src="/brand/prospecta-logo.svg" alt="Prospecta Worbita" width={216} height={50} priority />
        </a>
        <nav aria-label="Navegação principal"><a href="#plataforma">Plataforma</a><a href="#demonstracao">Demonstração</a><a href="#planos">Planos</a></nav>
        <div className="header-actions"><a className="header-login" href="/login">Entrar</a><a className="header-cta" href="/inscreva-se">Teste grátis <span aria-hidden="true">→</span></a></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Inteligência comercial B2B</p>
          <h1>Encontre empresas com potencial e transforme sinais em oportunidades.</h1>
          <p className="hero-lede">Pesquisa, qualificação e organização de potenciais clientes em um fluxo simples, mensurável e pronto para crescer com sua operação.</p>
          <div className="hero-actions"><a className="button button-primary" href="/inscreva-se">Começar teste grátis <span aria-hidden="true">→</span></a><a className="button button-secondary" href="#demonstracao">Ver demonstração</a></div>
          <p className="disclosure">3 dias · até 15 leads · confirmação manual de disparos · sem cartão</p>
        </div>
        <div className="hero-visual">
          <Image className="hero-image" src="/images/prospecta-hero-v2.png" alt="Ambiente de inteligência comercial com mapa do Brasil e conexões empresariais qualificadas" fill priority quality={95} sizes="(max-width: 900px) 100vw, 48vw" />
          <div className="signal-card signal-card-top"><span>SINAL QUALIFICADO</span><strong>Potencial identificado</strong><small>Presença digital e contato validados</small></div>
          <div className="signal-card signal-card-bottom"><span>FLUXO COMERCIAL</span><strong>Pronto para análise</strong><small>Pesquisa, validação e organização</small></div>
        </div>
      </section>

      <section className="capabilities section" id="plataforma">
        <div className="section-heading"><p className="eyebrow"><span /> Arquitetura do sistema</p><h2>Construído em torno do trabalho, não apenas do painel.</h2><p>Cada camada possui uma responsabilidade clara e uma fronteira operacional visível.</p></div>
        <div className="capability-grid">{capabilities.map((capability, index) => <article className="capability-card" style={{ "--card-index": index } as CSSProperties} key={capability.number}><span className="capability-number">{capability.number}</span><h3>{capability.title}</h3><p>{capability.copy}</p></article>)}</div>
      </section>

      <section className="demo-section section" id="demonstracao">
        <div className="section-heading split-heading"><div><p className="eyebrow"><span /> Demonstração interativa</p><h2>Um ambiente real de qualificação.</h2></div><p>Pesquise, segmente e selecione empresas fictícias. Todos os números abaixo são calculados a partir dos dados exibidos na demonstração.</p></div>
        <DashboardDemo />
      </section>

      <section className="pricing section" id="planos">
        <div className="section-heading split-heading"><div><p className="eyebrow"><span /> Planos por maturidade</p><h2>Comece controlado. Evolua quando o processo provar valor.</h2></div><p>Essential e Growth são ofertas mensais para contas individuais. Demandas Scale são definidas com o time comercial.</p></div>
        <div className="pricing-grid">{plans.map((plan) => <article className={plan.featured ? "pricing-card featured" : "pricing-card"} key={plan.name}>{plan.featured ? <span className="popular-label">MAIS COMPLETO</span> : null}<p className="plan-name">{plan.name}</p><h3>{plan.price}</h3><p className="plan-audience">{plan.audience}</p><ul>{plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul><a className={plan.featured ? "button button-primary" : "button button-secondary"} href={plan.href}>{plan.cta}</a></article>)}</div>
        <p className="pricing-note">O teste gratuito é limitado a 15 leads em três dias. O uso de dados e disparos obedece aos limites, controles e termos da plataforma.</p>
      </section>

      <section className="architecture section" id="arquitetura">
        <div className="architecture-copy"><p className="eyebrow eyebrow-light"><span /> Arquitetura de referência</p><h2>Limites claros. Componentes substituíveis. Entrega observável.</h2><p>A edição pública demonstra as camadas de apresentação e qualificação. A arquitetura operacional suporta aquisição externa, validação por APIs, persistência em PostgreSQL e transferência controlada para o CRM.</p><a className="text-link" href="https://github.com/eduardondrops/prospecta-b2b-intelligence/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noreferrer">Consultar documentação técnica <span aria-hidden="true">↗</span></a></div>
        <div className="operations-visual">
          <Image src="/images/prospecta-operations.png" alt="Fluxo operacional de empresas pesquisadas, contatos validados e pipeline comercial" fill quality={90} sizes="(max-width: 900px) 100vw, 55vw" />
          <div className="operations-caption"><span>OPERAÇÃO CONECTADA</span><strong>Da pesquisa ao acompanhamento comercial</strong></div>
        </div>
      </section>

      <section className="stack-strip" aria-label="Tecnologias de engenharia"><p>TECNOLOGIAS</p><StackLogos /></section>
      <footer>
        <div className="footer-product"><span className="footer-mark" aria-hidden="true">P</span><div><strong>Prospecta Worbita</strong><p>Plataforma de inteligência B2B</p></div></div>
        <a className="ambern-credit" href="https://ambern.dev" target="_blank" rel="noreferrer" aria-label="Site criado pela Ambern — visitar ambern.dev"><Image src="/brand/ambern-mark.svg" alt="" width={30} height={30} /><span>Um produto digital criado pela <strong>Ambern</strong><small>ambern.dev ↗</small></span></a>
        <div className="footer-links"><a href="/termos">Termos</a><a href="/privacidade">Privacidade</a><a href="/login">Entrar</a><a href="https://github.com/amberndev" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </footer>
    </main>
  );
}
