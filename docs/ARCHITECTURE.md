# Architecture

## Context

Prospecta models a workflow in which heterogeneous business records are acquired from authorized sources, normalized, qualified, stored, and presented to a commercial operator. The current edition implements the SaaS access layer and keeps all displayed prospect data deterministic and inspectable.

## System boundaries

| Layer | Responsibility | Production option | Public demo |
| --- | --- | --- | --- |
| Acquisition | Collect authorized source records | Provider APIs and controlled imports | Not connected |
| Orchestration | Retry, normalize, and route jobs | n8n workflows | Documented boundary |
| Application API | Validate commands, authenticate users, and enforce entitlements | Typed route handlers | Implemented |
| Identity and usage | Store accounts, sessions, plans, and usage events | Cloudflare D1 | Implemented |
| Prospect persistence | Store prospects, evidence, enrichment, and lists | PostgreSQL | Planned; synthetic fixture today |
| Product UI | Present, search, explain, and prioritize prospects | Next.js/React | Implemented |
| Delivery | Build, release, observe, and roll back | Cloudflare Workers | Provisioned; full bundle release in progress |

## Data flow

1. A user authenticates and the API resolves the account, plan, trial expiration, and current allowance.
2. A search command is rejected server-side when the allowance is exhausted.
3. During the current showcase phase, the API filters a deterministic synthetic dataset.
4. In the target pipeline, an acquisition job receives a scoped request and correlation identifier.
5. Orchestration retrieves authorized records with bounded retries and maps them into a canonical model.
6. Validation, deduplication, and evidence capture occur before prospect persistence.
7. The API returns only tenant-authorized records and records the usage event atomically.
8. Structured logs connect user requests, orchestration runs, persistence events, and release versions.

## Qualification model

The demo score is fixture data constrained to the range `0..100`. A production implementation should persist both the score and its individual inputs so that the result remains explainable. Model-assisted enrichment may propose attributes, but deterministic validation must decide whether they enter the system of record.

## Cloud runtime

The application uses the official Cloudflare `vinext` path for the Next.js App Router API surface. Static assets and server rendering are packaged for Workers. Wrangler enables observability and source-map upload; secrets must be stored as Worker secrets rather than committed variables.

## Data ownership

- D1 is the current system of record for users, sessions, plan entitlements, and usage events.
- The synthetic prospect fixture is a presentation dataset, not a customer database.
- PostgreSQL is the target system of record for multi-tenant prospect and enrichment data.
- n8n will orchestrate authorized provider calls; it will not become the system of record.

## Scalability path

- Add a queue between acquisition and enrichment when upstream rate limits become material.
- Add PostgreSQL through a pooled connection layer when live prospect workflows are enabled.
- Partition tenant data at every query boundary and enforce authorization server-side.
- Introduce idempotency keys before retries can create duplicate prospects or events.
- Add distributed traces only after stable correlation identifiers exist across every layer.

## Deliberate exclusions

The public repository excludes live provider credentials, customer datasets, messaging credentials, and private automation exports. Authentication and usage controls are included, while email verification, password recovery, billing, live acquisition, and enrichment remain roadmap items and must not be presented as complete.
