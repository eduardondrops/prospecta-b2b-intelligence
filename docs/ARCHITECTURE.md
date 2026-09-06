# Architecture

## Context

Prospecta models a workflow in which heterogeneous business records are acquired from authorized sources, normalized, qualified, stored, and presented to a commercial operator. The Cloudflare application is the identity and entitlement control plane; the original Vercel application remains the operational interface for every plan.

## System boundaries

| Layer | Responsibility | Production option | Public demo |
| --- | --- | --- | --- |
| Acquisition | Collect authorized source records | Provider APIs and controlled imports | Connected through the original application |
| Orchestration | Retry, normalize, and route jobs | n8n workflows | Existing operational boundary |
| Application API | Validate commands, authenticate users, and enforce entitlements | Typed route handlers | Implemented |
| Identity and usage | Store accounts, sessions, plans, and usage events | Cloudflare D1 | Implemented |
| Prospect persistence | Store prospects, evidence, enrichment, and lists | Supabase/PostgreSQL | Existing operational persistence; consolidation planned |
| Product UI | Present, search, explain, and prioritize prospects | Next.js/React | Implemented |
| Delivery | Build, release, observe, and roll back | Cloudflare Workers | Provisioned; Phase 1 release candidate validated |

## Data flow

1. A user authenticates and the API resolves the account, plan, trial expiration, and current allowance.
2. A search command reserves, atomically in D1, only the leads still available in the account window.
3. The Worker creates a short-lived operational token, stores only its hash in D1, and bridges the verified user to the original application.
4. Before Google or private-base acquisition, the original application presents that token to the Worker and receives a lead reservation bounded by the plan and remaining balance.
5. Orchestration retrieves authorized records with bounded retries and maps them into a canonical model.
6. Validation, deduplication, and evidence capture occur before prospect persistence.
7. After acquisition, the original application settles the reservation with the number of leads actually delivered. Failures settle zero; if reconciliation is unavailable, the original reservation remains as the fail-closed balance.
8. Structured logs connect user requests, orchestration runs, persistence events, and release versions.

## Qualification model

The demo score is fixture data constrained to the range `0..100`. A production implementation should persist both the score and its individual inputs so that the result remains explainable. Model-assisted enrichment may propose attributes, but deterministic validation must decide whether they enter the system of record.

## Cloud runtime

The application uses the official Cloudflare `vinext` path for the Next.js App Router API surface. Static assets and server rendering are packaged for Workers. Wrangler enables observability and source-map upload; secrets must be stored as Worker secrets rather than committed variables.

## Data ownership

- D1 is the current system of record for users, sessions, plan entitlements, lead reservations, and settled usage events.
- The synthetic prospect fixture remains presentation-only and is no longer the authenticated customer workspace.
- Supabase/PostgreSQL remains the current operational store; a consolidated self-hosted PostgreSQL architecture is planned.
- n8n orchestrates authorized provider calls; it is not the system of record.

## Scalability path

- Add a queue between acquisition and enrichment when upstream rate limits become material.
- Add PostgreSQL through a pooled connection layer when live prospect workflows are enabled.
- Partition tenant data at every query boundary and enforce authorization server-side.
- Introduce idempotency keys before retries can create duplicate prospects or events.
- Add distributed traces only after stable correlation identifiers exist across every layer.

## Deliberate exclusions

The public repository excludes live provider credentials, customer datasets, messaging credentials, and private automation exports. Authentication, email verification, password recovery, session revocation, account states, administrative audit, and usage controls are implemented. Transactional-email provider configuration and production journey verification remain deployment gates; billing, live acquisition, and enrichment remain roadmap items and must not be presented as complete.
