import type { CSSProperties } from "react";

export function AccessFlowDiagram() {
  const steps = [
    { x: 44, title: "SUA EMPRESA", detail: "Ponto de partida", icon: "building" },
    { x: 184, title: "PROSPECÇÃO", detail: "Dados qualificados", icon: "radar" },
    { x: 324, title: "MENSAGENS", detail: "Contato direcionado", icon: "message" },
    { x: 464, title: "NEGÓCIO FECHADO", detail: "Nova oportunidade", icon: "deal" },
  ] as const;

  return (
    <div className="access-flow" aria-label="Fluxo: sua empresa, prospecção de dados de clientes, envio de mensagens e negócio fechado">
      <svg viewBox="0 0 508 172" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="accessLine" x1="0" x2="1">
            <stop offset="0" stopColor="#d5e2d9" />
            <stop offset="1" stopColor="#e47c5e" />
          </linearGradient>
          <filter id="accessGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <path className="access-flow-line" d="M72 57H436" />
        {[114, 254, 394].map((x) => <path className="access-flow-arrow" key={x} d={`M${x} 52l9 5-9 5`} />)}

        {steps.map((step, index) => (
          <g className="access-flow-step" style={{ "--step": index } as CSSProperties} key={step.title} transform={`translate(${step.x} 57)`}>
            <circle className="access-flow-halo" r="31" />
            <circle className="access-flow-node" r="24" />
            {step.icon === "building" ? <path d="M-10 10V-8h20v18M-5-3h3m4 0h3m-10 6h3m4 0h3M-14 10h28" /> : null}
            {step.icon === "radar" ? <><circle r="11" /><circle r="5" /><path d="M0 0l8-8M-14 0h5M9 0h5M0-14v5M0 9v5" /></> : null}
            {step.icon === "message" ? <path d="M-13-9h26v17H1l-8 7 2-7h-8V-9Zm6 6h14M-7 2H4" /> : null}
            {step.icon === "deal" ? <><path d="M-13 2l8 8 18-19" /><circle r="17" filter="url(#accessGlow)" /></> : null}
          </g>
        ))}

        {steps.map((step) => (
          <g className="access-flow-label" key={`${step.title}-label`} transform={`translate(${step.x} 113)`}>
            <text className="access-flow-title" textAnchor="middle">{step.title}</text>
            <text className="access-flow-detail" textAnchor="middle" y="18">{step.detail}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
