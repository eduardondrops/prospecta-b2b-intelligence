import { DashboardDemo } from "./components/dashboard-demo";

const capabilities = [
  { number: "01", title: "Acquisition pipelines", copy: "Composable workflows collect, normalize, and validate business data before it reaches the product layer." },
  { number: "02", title: "Qualification engine", copy: "Deterministic signals make every score explainable, auditable, and useful to a commercial team." },
  { number: "03", title: "Edge delivery", copy: "The portfolio edition runs on Cloudflare Workers with an observable, repeatable deployment path." },
];

const stack = ["Next.js", "React", "TypeScript", "Cloudflare Workers", "PostgreSQL", "n8n", "REST APIs", "CI/CD"];

export const revalidate = 300;

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Prospecta home"><span className="brand-mark" aria-hidden="true">P</span><span>PROSPECTA</span></a>
        <nav aria-label="Primary navigation"><a href="#platform">Platform</a><a href="#demo">Live demo</a><a href="#architecture">Architecture</a></nav>
        <a className="header-cta" href="https://github.com/eduardondrops" target="_blank" rel="noreferrer">View engineering profile <span aria-hidden="true">↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> B2B intelligence platform</p>
          <h1>Turn scattered business data into a focused sales pipeline.</h1>
          <p className="hero-lede">A production-minded case study for prospect discovery, enrichment, qualification, and operational handoff.</p>
          <div className="hero-actions"><a className="button button-primary" href="#demo">Explore the demo <span aria-hidden="true">↓</span></a><a className="button button-secondary" href="#architecture">Read the architecture</a></div>
          <p className="disclosure">Public portfolio edition · Synthetic data only · No customer information</p>
        </div>
        <div className="hero-visual" aria-label="Illustration of the prospecting data pipeline">
          <div className="radar-grid" aria-hidden="true"><div className="radar-ring ring-one" /><div className="radar-ring ring-two" /><div className="radar-ring ring-three" /><div className="radar-axis axis-x" /><div className="radar-axis axis-y" /><span className="radar-dot dot-one" /><span className="radar-dot dot-two" /><span className="radar-dot dot-three" /><span className="radar-dot dot-four" /></div>
          <div className="signal-card signal-card-top"><span>QUALIFIED SIGNAL</span><strong>High intent</strong><small>Digital presence + contact fit</small></div>
          <div className="signal-card signal-card-bottom"><span>PIPELINE STATUS</span><strong>Normalized</strong><small>Ready for commercial review</small></div>
        </div>
      </section>

      <section className="capabilities section" id="platform">
        <div className="section-heading"><p className="eyebrow"><span /> System design</p><h2>Built around the work, not the dashboard.</h2><p>Each layer has one responsibility and a visible operational boundary.</p></div>
        <div className="capability-grid">{capabilities.map((capability) => <article className="capability-card" key={capability.number}><span className="capability-number">{capability.number}</span><h3>{capability.title}</h3><p>{capability.copy}</p></article>)}</div>
      </section>

      <section className="demo-section section" id="demo">
        <div className="section-heading split-heading"><div><p className="eyebrow"><span /> Interactive product slice</p><h2>A working qualification workspace.</h2></div><p>Search, segment, and shortlist synthetic companies. Every number below is calculated from the displayed demo dataset.</p></div>
        <DashboardDemo />
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
      <footer><div><span className="footer-mark">P</span><div><strong>Prospecta</strong><p>B2B Intelligence Platform</p></div></div><p>Designed and engineered by Eduardo Nunes · AI Product Engineer</p><a href="https://github.com/eduardondrops" target="_blank" rel="noreferrer">GitHub ↗</a></footer>
    </main>
  );
}
