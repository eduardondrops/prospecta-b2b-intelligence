# Product roadmap

This roadmap separates verified capabilities from planned work. Dates are deliberately omitted until delivery capacity, data-provider contracts, and commercial priorities are agreed.

## Product principles

- Acquire and process only authorized business data.
- Keep qualification evidence explainable and auditable.
- Enforce tenant isolation, entitlements, and limits on the server.
- Treat automation as orchestration, not as the system of record.
- Never expose provider credentials, customer data, or private workflows in the public repository.
- Promote a release only after automated checks and a production smoke test pass.

## Phase 0 — Product and access foundation

**Status: complete in source**

- Marketing page, positioning, plan comparison, login, registration, and workspace.
- D1-backed users, sessions, entitlements, and usage events.
- Password hashing with PBKDF2 and secure session cookies.
- Seven-day trial restricted to three searches and five results per search.
- Type checking, automated tests, production build, and GitHub Actions.
- Independent Cloudflare Worker, D1 database, zone, and custom domain.

**Exit evidence:** a clean build, passing tests, versioned migration, and documented routes.

## Phase 1 — Production-ready showcase

**Status: in progress**

- Replace the provisional bootstrap Worker with the full application bundle.
- Validate homepage, registration, login, workspace, trial exhaustion, and health endpoint on the custom domain.
- Add same-origin protection to state-changing endpoints.
- Add rate limiting and bot protection to registration and login.
- Add error boundaries, structured logs, release identifiers, and an operational dashboard.
- Add privacy policy, terms of use, data-source disclosure, and account-deletion flow.
- Add verified email, password recovery, and session revocation.

**Exit criteria:** the primary journey works over HTTPS, abuse controls are active, operational errors are observable, and rollback is proven.

## Phase 2 — Authorized data acquisition

**Status: planned**

- Select providers based on data rights, coverage, freshness, rate limits, and cost.
- Define the canonical company, contact, evidence, and source models.
- Build n8n ingestion workflows with idempotency, bounded retries, and dead-letter handling.
- Normalize, validate, and deduplicate before persistence.
- Preserve source, collection time, consent/legal basis where applicable, and field-level provenance.
- Introduce PostgreSQL for multi-tenant prospect, enrichment, and audit workloads.

**Exit criteria:** every live record is traceable to an authorized source, duplicates are controlled, and tenant access is enforced at every query boundary.

## Phase 3 — Operational prospecting workflow

**Status: planned**

- Saved searches, persistent lists, tags, notes, and ownership.
- Explainable qualification rules and configurable ideal-customer profiles.
- Enrichment jobs with visible state, retry, and cost controls.
- CSV export for eligible plans with audit events.
- n8n webhooks and signed outbound events.
- Background queues for acquisition and enrichment workloads.

**Exit criteria:** an operator can move from criteria to an auditable, reusable prospect list without manual data reconciliation.

## Phase 4 — Commercial SaaS

**Status: planned**

- Select the billing provider and define validated prices; no placeholder prices will be published.
- Checkout, subscriptions, invoices, webhooks, cancellations, and failed-payment handling.
- Essential, Growth, and Scale entitlements controlled from one server-side policy.
- Organization workspaces, invitations, roles, and audit log.
- CRM/API integrations for eligible plans.
- Usage, conversion, retention, support, and infrastructure-cost reporting.

**Exit criteria:** paid access is activated and revoked automatically, billing events are idempotent, and plan promises match enforced functionality.

## Phase 5 — Intelligence and scale

**Status: planned**

- Assisted research with cited evidence and human review.
- Semantic matching and explainable recommendations.
- Feedback loops for qualification quality without silently changing customer data.
- Provider failover, cost budgets, caching, and regional performance work.
- Formal backup, recovery, incident response, and service-level objectives.

**Exit criteria:** intelligence features remain explainable, measured, cost-controlled, and recoverable under production load.

## Near-term priority order

1. Publish and verify the full interface on `prospectaworbita.site`.
2. Complete security, recovery, legal, and observability requirements.
3. Select one authorized data source and deliver one narrow end-to-end ingestion path.
4. Add persistent prospect lists and auditable export.
5. Validate pricing with real users before implementing billing.

## Explicitly not claimed

- No live acquisition or enrichment provider is connected today.
- No payment provider or validated pricing is implemented today.
- No customer or revenue metrics are claimed.
- No production scale or service-level objective is claimed before measurement.
