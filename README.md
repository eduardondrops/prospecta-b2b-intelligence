# Prospecta B2B Intelligence

A production-minded portfolio case study for transforming fragmented business data into an actionable commercial pipeline.

**Live application:** [prospectaworbita.site](https://prospectaworbita.site)
**Engineering:** Eduardo Nunes — AI Product Engineer · Full-Stack · Data & Cloud Engineering

> This repository is a clean public demonstration. It contains synthetic companies only and does not include customer data, credentials, internal endpoints, or private automation workflows.

## What this project demonstrates

- A responsive product interface built with Next.js-style App Router, React, and TypeScript.
- Interactive filtering and session-level shortlisting over a deterministic sample dataset.
- Explicit separation between acquisition, orchestration, validation, persistence, and presentation.
- A Cloudflare Workers deployment with source maps, observability, and a custom domain.
- Automated type checking, dataset safety tests, and production builds in CI.
- Security and privacy decisions appropriate for a public engineering portfolio.

## Product slice

The demo models the commercial review step of a larger prospecting workflow. Users can search and segment companies, inspect explainable qualification signals, and build a temporary shortlist. All displayed metrics are calculated from the visible synthetic dataset; they are not business-performance claims.

## Reference architecture

```text
Authorized sources
       │
       ▼
n8n orchestration ── normalization ── validation
       │
       ▼
Typed API ───── PostgreSQL ───── Next.js product UI
                                      │
                                      ▼
                              Cloudflare Workers
```

The public build intentionally implements the product slice without external services. The production pattern can add PostgreSQL, authenticated APIs, queues, and audited automation boundaries without changing the UI contract.

## Technology

- Next.js App Router API surface via `vinext`
- React + TypeScript
- Tailwind CSS toolchain with a custom design system
- Cloudflare Workers + Wrangler
- Vitest
- GitHub Actions

## Local development

Requirements: a current Node.js LTS release and npm.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The health endpoint is available at `/api/health`.

## Quality gates

```bash
npm run typecheck
npm run test
npm run build
```

Or run the complete pipeline with `npm run check`.

## Deployment

The application is configured for Cloudflare Workers. Deployment is intentionally separate from CI so that repository forks cannot publish into a production account.

```bash
npm run deploy
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the release and rollback procedure.

## Engineering documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Security and privacy](SECURITY.md)
- [Deployment runbook](docs/DEPLOYMENT.md)
- [ADR 001: public portfolio boundary](docs/adr/001-public-portfolio-boundary.md)

## License

MIT © Eduardo Nunes
