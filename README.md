# Prospecta Worbita — B2B Intelligence

An operational SaaS foundation for transforming authorized business data into an actionable, explainable commercial pipeline.

**Live application:** [prospectaworbita.site](https://prospectaworbita.site)
**Engineering:** Eduardo Nunes — AI Product Engineer · Full-Stack · Data & Cloud Engineering

> The account, session, entitlement, and usage-control flows are implemented. Searchable companies remain synthetic until an authorized acquisition provider is connected; no customer data, credentials, internal endpoints, or private automation workflows are included.

## Delivery status

| Capability | Status | Evidence |
| --- | --- | --- |
| Marketing, pricing, login, registration, and workspace UI | Complete | Application routes and production build |
| D1 accounts, sessions, entitlements, and usage events | Complete | Versioned migration and API routes |
| Seven-day, three-search trial enforcement | Complete | Server-side entitlement checks and tests |
| Cloudflare zone, Worker, D1, and custom domain | Provisioned | Infrastructure configuration and deployment runbook |
| Public access layer on Cloudflare | Complete | Live landing, authentication, trial workspace, D1, and custom domain |
| Original full platform | Published separately | Preserved at `app.prospectaworbita.site` with an authenticated `scale` access bridge |
| Authorized live prospect acquisition and enrichment | Planned | Provider selection and compliance review required |
| Billing and paid plan activation | Planned | Commercial provider not selected |

## What this project demonstrates

- A responsive product interface built with Next.js-style App Router, React, and TypeScript.
- Interactive filtering and session-level shortlisting over a deterministic sample dataset.
- Explicit separation between acquisition, orchestration, validation, persistence, and presentation.
- A Cloudflare Workers deployment with source maps, observability, and a custom domain.
- Automated type checking, dataset safety tests, and production builds in CI.
- Security and privacy decisions appropriate for a public engineering portfolio.
- D1-backed accounts, sessions, plan entitlements, and usage events.
- A seven-day trial restricted to three searches and five results per search.
- Marketing, pricing, sign-in, sign-up, and authenticated workspace routes.

## Product slice

The current release models the commercial review step of a larger prospecting workflow. Users can create an account, sign in, search and segment companies, inspect explainable qualification signals, and use a deliberately restricted trial. All displayed prospect data is synthetic and all visible metrics are derived from that dataset; they are not business-performance claims.

## Reference architecture

```text
Authorized sources
       │
       ▼
n8n orchestration ── normalization ── validation
       │
       ▼
Typed API ───── D1 / PostgreSQL ───── Next.js product UI
                                      │
                                      ▼
                              Cloudflare Workers
```

The public build uses D1 for identity, sessions, entitlements, and usage. PostgreSQL remains the planned data platform for richer prospect, enrichment, and analytics workloads once a lawful acquisition source is selected.

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

Apply the D1 schema before testing authenticated flows:

```bash
npx wrangler d1 migrations apply prospecta-production --local
```

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

- [Agent operating guide](AGENTS.md)
- [Product definition](docs/PRODUCT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Product roadmap](docs/ROADMAP.md)
- [Product and delivery pipelines](docs/PIPELINES.md)
- [Security and privacy](SECURITY.md)
- [Deployment runbook](docs/DEPLOYMENT.md)
- [ADR 001: public portfolio boundary](docs/adr/001-public-portfolio-boundary.md)

## License

MIT © Eduardo Nunes
