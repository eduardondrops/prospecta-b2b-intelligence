import { DashboardDemo } from "./components/dashboard-demo";

const capabilities = [
  { number: "01", title: "Acquisition pipelines", copy: "Composable workflows collect, normalize, and validate business data before it reaches the product layer." },
  { number: "02", title: "Qualification engine", copy: "Deterministic signals make every score explainable, auditable, and useful to a commercial team." },
  { number: "03", title: "Edge delivery", copy: "The portfolio edition runs on Cloudflare Workers with an observable, repeatable deployment path." },
];

const stack = ["Next.js", "React", "TypeScript", "Cloudflare Workers", "PostgreSQL", "n8n", "REST APIs", "CI/CD"];

const plans = [
  { name: "Essential", audience: "Para validar um processo comercial recorrente", features: ["150 pesquisas por mês", "Até 25 resultados por pesquisa", "Listas e exportação CSV", "1 usuário"], cta: "Solicitar acesso" },
  { name: "Growth", audience: "Para times que precisam escalar prospecção", features: ["1.000 pesquisas por mês", "Até 100 resultados por pesquisa", "Enriquecimento e exportações", "n8n, webhooks e 5 usuários"], cta: "Falar sobre o Growth", featured: true },
  { name: "Scale", audience: "Para operações com integração e governança", features: ["Limites personalizados", "API e integração com CRM", "Papéis, auditoria e equipes", "Suporte de implantação"], cta: "Desenhar plano Scale" },
];

export const revalidate = 300;

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Prospecta home"><span className="brand-mark" aria-hidden="true">P</span><span>PROSPECTA</span></a>
        <nav aria-label="Navegação principal"><a href="#plataforma">Plataforma</a><a href="#demonstracao">Demonstração</a><a href="#planos">Planos</a></nav>
        <div className="header-actions"><a className="header-login" href="/login">Entrar</a><a className="header-cta" href="/inscreva-se">Teste grátis <span aria-hidden="true">→</span></a></div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Inteligência comercial B2B</p>
          <h1>Encontre empresas com potencial e transforme sinais em oportunidades.</h1>
          <p className="hero-lede">Pesquisa, qualificação e organização de prospects em um fluxo simples, mensurável e pronto para crescer com sua operação.</p>
          <div className="hero-actions"><a className="button button-primary" href="/inscreva-se">Começar teste grátis <span aria-hidden="true">→</span></a><a className="button button-secondary" href="#demonstracao">Ver demonstração</a></div>
          <p className="disclosure">7 dias · 3 pesquisas · até 5 resultados por pesquisa · sem cartão</p>
        </div>
        <div className="hero-visual" aria-label="Illustration of the prospecting data pipeline">
          <div className="radar-grid" aria-hidden="true"><div className="radar-ring ring-one" /><div className="radar-ring ring-two" /><div className="radar-ring ring-three" /><div className="radar-axis axis-x" /><div className="radar-axis axis-y" /><span className="radar-dot dot-one" /><span className="radar-dot dot-two" /><span className="radar-dot dot-three" /><span className="radar-dot dot-four" /></div>
          <div className="signal-card signal-card-top"><span>QUALIFIED SIGNAL</span><strong>High intent</strong><small>Digital presence + contact fit</small></div>
          <div className="signal-card signal-card-bottom"><span>PIPELINE STATUS</span><strong>Normalized</strong><small>Ready for commercial review</small></div>
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
        <div className="section-heading split-heading"><div><p className="eyebrow"><span /> Planos por maturidade</p><h2>Comece controlado. Evolua quando o processo provar valor.</h2></div><p>Os preços serão definidos antes da abertura comercial. As capacidades abaixo já estabelecem limites claros entre experimentação, operação e escala.</p></div>
        <div className="pricing-grid">{plans.map((plan) => <article className={plan.featured ? "pricing-card featured" : "pricing-card"} key={plan.name}>{plan.featured ? <span className="popular-label">MAIS COMPLETO</span> : null}<p className="plan-name">{plan.name}</p><h3>Preço sob consulta</h3><p className="plan-audience">{plan.audience}</p><ul>{plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul><a className={plan.featured ? "button button-primary" : "button button-secondary"} href="mailto:contato@prospectaworbita.site?subject=Interesse%20no%20Prospecta">{plan.cta}</a></article>)}</div>
        <p className="pricing-note">O teste grátis é deliberadamente limitado e não inclui exportação, enriquecimento, API ou automações.</p>
      </section>

      <section className="architecture section" id="architecture">
        <div className="architecture-copy"><p className="eyebrow eyebrow-light"><span /> Reference architecture</p><h2>Clear boundaries. Replaceable parts. Observable delivery.</h2><p>The public edition demonstrates the presentation and qualification layer. The production pattern supports external acquisition workflows, API validation, PostgreSQL persistence, and controlled CRM handoff.</p><a className="text-link" href="https://github.com/eduardondrops/prospecta-b2b-intelligence/blob/main/docs/ARCHITECTURE.md" target="_blank" rel="noreferrer">Review technical documentation <span aria-hidden="true">↗</span></a></div>
        <div className="architecture-flow" role="img" aria-label="Data sources flow through orchestration and validation into an API, PostgreSQL, and the web application">
          <div className="flow-column"><span className="flow-label">INPUT</span><div className="flow-node"><strong>Business sources</strong><small>Public & authorized data</small></div></div><span className="flow-arrow" aria-hidden="true">→</span>
          <div className="flow-column"><span className="flow-label">PROCESS</span><div className="flow-node accent"><strong>n8n workflows</strong><small>Normalize & validate</small></div></div><span className="flow-arrow" aria-hidden="true">→</span>
          <div className="flow-column flow-stack"><span className="flow-label">PRODUCT</span><div className="flow-node"><strong>Typed API</strong><small>Business rules</small></div><div className="flow-node"><strong>PostgreSQL</strong><small>Durable state</small></div><div className="flow-node"><strong>Next.js UI</strong><small>Commercial workflow</small></div></div>
        </div>
      </section>

      <section className="stack-strip" aria-label="Technology stack"><p>ENGINEERING STACK</p><div>{stack.map((item) => <span key={item}>{item}</span>)}</div></section>
      <footer><div><span className="footer-mark">P</span><div><strong>Prospecta</strong><p>Plataforma de inteligência B2B</p></div></div><p>Produto e engenharia por Eduardo Nunes · AI Product Engineer</p><div className="footer-links"><a href="/login">Entrar</a><a href="https://github.com/eduardondrops" target="_blank" rel="noreferrer">GitHub ↗</a></div></footer>
    </main>
  );
}

