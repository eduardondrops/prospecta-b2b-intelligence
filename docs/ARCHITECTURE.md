# Architecture

## Context

Prospecta models a workflow in which heterogeneous business records are acquired from authorized sources, normalized, qualified, stored, and presented to a commercial operator. This public edition focuses on the product boundary and makes all data deterministic and inspectable.

## System boundaries

| Layer | Responsibility | Production option | Public demo |
| --- | --- | --- | --- |
| Acquisition | Collect authorized source records | Provider APIs and controlled imports | Not connected |
| Orchestration | Retry, normalize, and route jobs | n8n workflows | Documented boundary |
| Application API | Validate commands and enforce business rules | Typed route handlers | Health endpoint |
| Persistence | Store tenants, prospects, events, and lists | PostgreSQL | In-memory synthetic fixture |
| Product UI | Search, explain, and prioritize prospects | Next.js/React | Fully implemented |
| Delivery | Build, release, observe, and roll back | Cloudflare Workers | Fully implemented |

## Data flow

1. An acquisition job receives a scoped request and a correlation identifier.
2. Orchestration retrieves authorized records with bounded retries and timeouts.
3. A normalization contract maps provider-specific fields into a canonical prospect model.
4. Validation rejects incomplete or malformed records before persistence.
5. The application API exposes only tenant-authorized records to the product interface.
6. Structured logs connect the user request, orchestration run, and persistence event.

## Qualification model

The demo score is fixture data constrained to the range `0..100`. A production implementation should persist both the score and its individual inputs so that the result remains explainable. Model-assisted enrichment may propose attributes, but deterministic validation must decide whether they enter the system of record.

## Cloud runtime

The application uses the official Cloudflare `vinext` path for the Next.js App Router API surface. Static assets and server rendering are packaged for Workers. Wrangler enables observability and source-map upload; secrets must be stored as Worker secrets rather than committed variables.

## Scalability path

- Add a queue between acquisition and enrichment when upstream rate limits become material.
- Add PostgreSQL through a pooled connection layer when persistent multi-user workflows are enabled.
- Partition tenant data at every query boundary and enforce authorization server-side.
- Introduce idempotency keys before retries can create duplicate prospects or events.
- Add distributed traces only after stable correlation identifiers exist across every layer.

## Deliberate exclusions

The public repository excludes authentication, live data ingestion, customer schemas, provider credentials, messaging endpoints, and private workflow exports. These exclusions are security boundaries, not missing demo features.
