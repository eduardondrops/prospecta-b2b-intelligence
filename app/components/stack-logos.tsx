const tools = [
  { name: "Next.js", icon: <><circle cx="24" cy="24" r="18" /><path d="M16 33V16l16 20V15" /></> },
  { name: "React", icon: <><circle cx="24" cy="24" r="3" fill="currentColor" /><ellipse cx="24" cy="24" rx="19" ry="7" /><ellipse cx="24" cy="24" rx="19" ry="7" transform="rotate(60 24 24)" /><ellipse cx="24" cy="24" rx="19" ry="7" transform="rotate(120 24 24)" /></> },
  { name: "TypeScript", icon: <><rect x="7" y="7" width="34" height="34" rx="3" fill="currentColor" /><path d="M13 20h15M20.5 20v17M31 34c2 2 8 2 8-2 0-5-8-2-8-7 0-4 6-5 9-2" stroke="#c55235" /></> },
  { name: "Cloudflare Workers", icon: <><path d="M7 30c1-6 6-10 12-10 2-7 8-11 15-8 5 2 8 6 8 12 3 1 5 3 5 6H7Z" fill="currentColor" /><path d="M13 36h27M18 41h17" /></> },
  { name: "PostgreSQL", icon: <><path d="M13 13c6-6 23-5 25 5 2 8-1 18-8 19l-2 7-5-1 1-8c-7-2-11-9-11-22Z" /><path d="M24 21c5-3 10 0 9 5-1 5-8 5-9 1-1-3 1-5 4-4" /></> },
  { name: "n8n", icon: <><circle cx="9" cy="29" r="4" /><circle cx="20" cy="17" r="4" /><circle cx="31" cy="29" r="4" /><circle cx="41" cy="15" r="4" /><path d="m12 26 5-6m6 0 5 6m7 0 4-7" /></> },
  { name: "APIs REST", icon: <><path d="m18 11-9 13 9 13M30 11l9 13-9 13M27 8l-6 32" /></> },
  { name: "CI/CD", icon: <><path d="M24 16c-5-7-15-7-15 2 0 8 8 12 15 18 7-6 15-10 15-18 0-9-10-9-15-2Z" /><path d="m18 25 4 4 8-10" /></> },
];

export function StackLogos() {
  return (
    <div className="stack-logos">
      {tools.map((tool) => (
        <span className="stack-logo" key={tool.name} aria-label={tool.name} title={tool.name}>
          <svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">{tool.icon}</svg>
        </span>
      ))}
    </div>
  );
}
