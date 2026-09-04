"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { companies } from "../data/companies";

const segments = ["All", ...new Set(companies.map((company) => company.segment))];

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
        <div className="workspace-label">WORKSPACE</div>
        <button className="sidebar-item active" type="button"><span aria-hidden="true">⌁</span> Overview</button>
        <button className="sidebar-item" type="button"><span aria-hidden="true">◎</span> Prospects <b>{companies.length}</b></button>
        <button className="sidebar-item" type="button"><span aria-hidden="true">◇</span> Shortlist <b>{shortlist.size}</b></button>
        <button className="sidebar-item" type="button"><span aria-hidden="true">↻</span> Pipelines</button>
        <div className="demo-badge"><i /> DEMO WORKSPACE<small>Synthetic dataset</small></div>
      </aside>
      <div className="dashboard-content">
        <div className="dashboard-title-row"><div><span>PROSPECTING / OVERVIEW</span><h3>Qualification workspace</h3></div><div className="data-state"><i /> Dataset ready</div></div>
        <div className="metric-grid"><div><span>VISIBLE PROSPECTS</span><strong>{filteredCompanies.length.toString().padStart(2, "0")}</strong><small>Current selection</small></div><div><span>AVERAGE SCORE</span><strong>{averageScore}</strong><small>Across sample</small></div><div><span>HIGH INTENT</span><strong>{highIntent}</strong><small>Explainable signals</small></div><div><span>SHORTLISTED</span><strong>{shortlist.size.toString().padStart(2, "0")}</strong><small>Session state</small></div></div>
        <div className="prospect-panel">
          <div className="panel-toolbar">
            <label className="search-field"><span className="sr-only">Search companies</span><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company or location" /></label>
            <label className="segment-field"><span className="sr-only">Filter by segment</span><select value={segment} onChange={(event) => setSegment(event.target.value)}>{segments.map((item) => <option value={item} key={item}>{item === "All" ? "All segments" : item}</option>)}</select></label>
          </div>
          <div className="table-wrap">
            <table><thead><tr><th>Company</th><th>Segment</th><th>Location</th><th>Data quality</th><th>Score</th><th><span className="sr-only">Shortlist</span></th></tr></thead>
              <tbody>{filteredCompanies.map((company) => {
                const isSelected = shortlist.has(company.id);
                return <tr key={company.id}><td><strong>{company.name}</strong><small>ID {company.id.toUpperCase()}</small></td><td>{company.segment}</td><td>{company.city}, {company.state}</td><td><span className={`quality ${company.contact === "Verified" ? "verified" : "partial"}`}><i /> {company.contact}</span></td><td><span className={`score score-${company.signal.toLowerCase()}`}>{company.score}</span></td><td><button className={isSelected ? "shortlist selected" : "shortlist"} onClick={() => toggleShortlist(company.id)} type="button" aria-pressed={isSelected} aria-label={`${isSelected ? "Remove" : "Add"} ${company.name} ${isSelected ? "from" : "to"} shortlist`}>{isSelected ? "✓" : "+"}</button></td></tr>;
              })}</tbody>
            </table>
            {filteredCompanies.length === 0 ? <p className="empty-state">No prospects match this selection.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
