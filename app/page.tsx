import Image from "next/image";
import { DashboardDemo } from "./components/dashboard-demo";

const capabilities = [
  { number: "01", title: "Acquisition pipelines", copy: "Composable workflows collect, normalize, and validate business data before it reaches the product layer." },
  { number: "02", title: "Qualification engine", copy: "Deterministic signals make every score explainable, auditable, and useful to a commercial team." },
  { number: "03", title: "Edge delivery", copy: "The portfolio edition runs on Cloudflare Workers with an observable, repeatable deployment path." },
];

const stack = ["Next.js", "React", "TypeScript", "Cloudflare Workers", "PostgreSQL", "n8n", "REST APIs", "CI/CD"];

const plans = [
  { name: "Essential", price: "R$ 49,90/mês", audience: "Para começar uma rotina comercial controlada", features: ["15 leads por dia", "1 WhatsApp conectado", "Todos os módulos com limites do plano", "Conta individual"], cta: "Começar no Essential" },
  { name: "Growth", price: "R$ 97,90/mês", audience: "Para ampliar a prospecção e os disparos", features: ["45 leads por dia", "3 WhatsApps conectados", "Todos os módulos com limites do plano", "Conta individual"], cta: "Começar no Growth", featured: true },
  { name: "Scale", price: "Sob consulta", audience: "Para demandas personalizadas ou enterprise", features: ["Limites sob análise", "WhatsApps conforme demanda", "Integrações e operação personalizadas", "Atendimento comercial"], cta: "Falar com o time comercial" },
];

export const revalidate = 300;

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Prospecta Worbita home"><span className="brand-mark" aria-hidden="true">P</span><span>PROSPECTA WORBITA</span></a>
        <nav aria-label="Navegação principal"><a href="#plataforma">Plataforma</a><a href="#demonstracao">Demonstração</a><a href="#planos">Planos</a></nav>
        <div className="header-actions"><a className="header-login" href="/login">Entrar</a><a className="header-cta" href="/inscreva-se">Teste grátis <span aria-hidden="true">→</span></a></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Inteligência comercial B2B</p>
          <h1>Encontre empresas com potencial e transforme sinais em oportunidades.</h1>
          <p className="hero-lede">Pesquisa, qualificação e organização de prospects em um fluxo simples, mensurável e pronto para crescer com sua operação.</p>
          <div className="hero-actions"><a className="button button-primary" href="/inscreva-se">Começar teste grátis <span aria-hidden="true">→</span></a><a className="button button-secondary" href="#demonstracao">Ver demonstração</a></div>
          <p className="disclosure">3 dias · até 15 leads · confirmação manual de disparos · sem cartão</p>
        </div>
        <div className="hero-visual">
          <Image className="hero-image" src="/images/prospecta-hero.png" alt="Ambiente de inteligência comercial exibindo um mapa de empresas e conexões qualificadas" fill priority sizes="(max-width: 900px) 100vw, 48vw" />
          <div className="signal-card signal-card-top"><span>SINAL QUALIFICADO</span><strong>Potencial identificado</strong><small>Presença digital e contato validados</small></div>
          <div className="signal-card signal-card-bottom"><span>FLUXO COMERCIAL</span><strong>Pronto para análise</strong><small>Pesquisa, validação e organização</small></div>
        </div>
      </section>

      <section className="capabilities section" id="plataforma">
        <div className="section-heading"><p className="eyebrow"><span /> System design</p><h2>Built around the work, not the dashboard.</h2><p>Each layer has one responsibility and a visible operational boundary.</p></div>
        <div className="capability-grid">{capabilities.map((capability) => <article className="capability-card" key={capability.number}><span className="capability-number">{capability.number}</span><h3>{capability.title}</h3><p>{capability.copy}</p></article>)}</div>
      </section>

      <section className="demo-section section" id="demonstracao">
        <div className="section-heading split-heading"><div><p className="eyebrow"><span /> Interactive product slice</p><h2>A working qualification workspace.</h2></div><p>Search, segment, and shortlist synthetic companies. Every number below is calculated from the displayed demo dataset.</p></div>
        <DashboardDemo />
      </section>

      <section className="pricing section" id="planos">
        <div className="section-heading split-heading"><div><p className="eyebrow"><span /> Planos por maturidade</p><h2>Comece controlado. Evolua quando o processo provar valor.</h2></div><p>Essential e Growth são ofertas mensais para contas individuais. Demandas Scale são definidas com o time comercial.</p></div>
        <div className="pricing-grid">{plans.map((plan) => <article className={plan.featured ? "pricing-card featured" : "pricing-card"} key={plan.name}>{plan.featured ? <span className="popular-label">MAIS COMPLETO</span> : null}<p className="plan-name">{plan.name}</p><h3>{plan.price}</h3><p className="plan-audience">{plan.audience}</p><ul>{plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul><a className={plan.featured ? "button button-primary" : "button button-secondary"} href="mailto:contato@prospectaworbita.site?subject=Interesse%20no%20Prospecta%20Worbita">{plan.cta}</a></article>)}</div>
        <p className="pricing-note">O teste gratuito é limitado a 15 leads em três dias. Dados reais e disparos serão ativados somente após a homologação das integrações e controles.</p>
      </section>

      <section className="architecture section" id="architecture">
        <div className="architecture-copy"><p className="eyebrow eyebrow-light"><span /> Reference architecture</p><h2>Clear boundaries. Replaceable parts. Observable delivery.</h2><p>The public edition demonstrates the presentation and qualification layer. The production pattern supports external acquisition workflows, API validation, PostgreSQL persistence, and controlled CRM handoff.</p><a className="text-link" href="https://github.com/eduardondrops/prospecta-b2b-intelligence/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noreferrer">Review technical documentation <span aria-hidden="true">↗</span></a></div>
        <div className="operations-visual">
          <Image src="/images/prospecta-operations.png" alt="Fluxo operacional de empresas pesquisadas, contatos validados e pipeline comercial" fill sizes="(max-width: 900px) 100vw, 55vw" />
          <div className="operations-caption"><span>OPERAÇÃO CONECTADA</span><strong>Da pesquisa ao acompanhamento comercial</strong></div>
        </div>
      </section>

      <section className="stack-strip" aria-label="Technology stack"><p>ENGINEERING STACK</p><div>{stack.map((item) => <span key={item}>{item}</span>)}</div></section>
      <footer><div><span className="footer-mark">P</span><div><strong>Prospecta Worbita</strong><p>Plataforma de inteligência B2B</p></div></div><p>Produto e engenharia por Eduardo Nunes · AI Product Engineer</p><div className="footer-links"><a href="/termos">Termos</a><a href="/privacidade">Privacidade</a><a href="/login">Entrar</a><a href="https://github.com/eduardondrops" target="_blank" rel="noreferrer">GitHub ↗</a></div></footer>
    </main>
  );
}
