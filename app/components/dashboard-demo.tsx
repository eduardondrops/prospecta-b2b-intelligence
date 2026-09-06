"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { companies } from "../data/companies";

const segments = ["All", ...new Set(companies.map((company) => company.segment))];
const segmentLabels = { All: "Todos os segmentos", Logistics: "Logística", Healthcare: "Saúde", Retail: "Varejo", Technology: "Tecnologia", Construction: "Construção" } as const;
const contactLabels = { Verified: "Verificado", Partial: "Parcial" } as const;
const signalClasses = { High: "high", Medium: "medium", Low: "low" } as const;

function segmentLabel(segment: string) {
  return segmentLabels[segment as keyof typeof segmentLabels] ?? segment;
}

export function DashboardDemo() {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState("All");
  const [shortlist, setShortlist] = useState<Set<string>>(() => new Set());
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase("pt-BR"));
  const filteredCompanies = useMemo(() => companies.filter((company) => {
    const matchesSegment = segment === "All" || company.segment === segment;
    const searchTarget = `${company.name} ${company.city} ${company.state}`.toLocaleLowerCase("pt-BR");
    return matchesSegment && searchTarget.includes(deferredQuery);
  }), [deferredQuery, segment]);
  const averageScore = Math.round(companies.reduce((total, company) => total + company.score, 0) / companies.length);
  const highIntent = companies.filter((company) => company.signal === "High").length;

  function toggleShortlist(id: string) {
    setShortlist((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="mini-brand"><span>P</span><strong>Prospecta</strong></div>
        <div className="workspace-label">AMBIENTE</div>
        <button className="sidebar-item active" type="button"><span aria-hidden="true">⌁</span> Visão geral</button>
        <button className="sidebar-item" type="button"><span aria-hidden="true">◎</span> Potenciais clientes <b>{companies.length}</b></button>
        <button className="sidebar-item" type="button"><span aria-hidden="true">◇</span> Selecionados <b>{shortlist.size}</b></button>
        <button className="sidebar-item" type="button"><span aria-hidden="true">↻</span> Pipelines</button>
        <div className="demo-badge"><i /> AMBIENTE DEMONSTRATIVO<small>Dados fictícios</small></div>
      </aside>
      <div className="dashboard-content">
        <div className="dashboard-title-row"><div><span>PROSPECÇÃO / VISÃO GERAL</span><h3>Ambiente de qualificação</h3></div><div className="data-state"><i /> Dados disponíveis</div></div>
        <div className="metric-grid"><div><span>EMPRESAS VISÍVEIS</span><strong>{filteredCompanies.length.toString().padStart(2, "0")}</strong><small>Seleção atual</small></div><div><span>PONTUAÇÃO MÉDIA</span><strong>{averageScore}</strong><small>Em toda a amostra</small></div><div><span>ALTO POTENCIAL</span><strong>{highIntent}</strong><small>Sinais explicáveis</small></div><div><span>SELECIONADOS</span><strong>{shortlist.size.toString().padStart(2, "0")}</strong><small>Estado desta sessão</small></div></div>
        <div className="prospect-panel">
          <div className="panel-toolbar">
            <label className="search-field"><span className="sr-only">Pesquisar empresas</span><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquise por empresa ou localização" /></label>
            <label className="segment-field"><span className="sr-only">Filtrar por segmento</span><select value={segment} onChange={(event) => setSegment(event.target.value)}>{segments.map((item) => <option value={item} key={item}>{segmentLabel(item)}</option>)}</select></label>
          </div>
          <div className="table-wrap">
            <table><thead><tr><th>Empresa</th><th>Segmento</th><th>Localização</th><th>Qualidade dos dados</th><th>Pontuação</th><th><span className="sr-only">Selecionar</span></th></tr></thead>
              <tbody>{filteredCompanies.map((company) => {
                const isSelected = shortlist.has(company.id);
                return <tr key={company.id}><td><strong>{company.name}</strong><small>ID {company.id.toUpperCase()}</small></td><td>{segmentLabel(company.segment)}</td><td>{company.city}, {company.state}</td><td><span className={`quality ${company.contact === "Verified" ? "verified" : "partial"}`}><i /> {contactLabels[company.contact]}</span></td><td><span className={`score score-${signalClasses[company.signal]}`}>{company.score}</span></td><td><button className={isSelected ? "shortlist selected" : "shortlist"} onClick={() => toggleShortlist(company.id)} type="button" aria-pressed={isSelected} aria-label={`${isSelected ? "Remover" : "Adicionar"} ${company.name} ${isSelected ? "da" : "à"} seleção`}>{isSelected ? "✓" : "+"}</button></td></tr>;
              })}</tbody>
            </table>
            {filteredCompanies.length === 0 ? <p className="empty-state">Nenhuma empresa corresponde a esta seleção.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
