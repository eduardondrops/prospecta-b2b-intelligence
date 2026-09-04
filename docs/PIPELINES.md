# Product and delivery pipelines

Prospecta has two related pipelines: the business-data pipeline that creates usable prospect intelligence, and the software-delivery pipeline that ships the product safely.

## Business-data pipeline

```text
Authorized source
      │
      ▼
Scoped acquisition request ── correlation ID + tenant + purpose
      │
      ▼
n8n orchestration ── timeout ── bounded retry ── rate-limit control
      │
      ▼
Normalization ── validation ── deduplication ── provenance
      │
      ▼
PostgreSQL system of record ── evidence ── audit events
      │
      ▼
Entitlement-aware API ── qualification rules ── usage accounting
      │
      ▼
Workspace ── saved lists ── export / webhook / CRM by plan
```

### Current implementation boundary

| Stage | Current state | Target state |
| --- | --- | --- |
| Acquisition | Synthetic deterministic dataset | Authorized provider APIs/imports |
| Orchestration | Architectural boundary defined | Versioned n8n workflows |
| Normalization | Typed fixture model | Provider adapters and canonical contracts |
| Persistence | D1 for identity, sessions, plans, and usage | PostgreSQL for prospects and enrichment; D1 retained where appropriate |
| Qualification | Explainable sample signals | Configurable, evidence-backed rules |
| Delivery to user | Authenticated search with strict trial limits | Saved lists, exports, webhooks, and CRM integrations by plan |

### Processing controls

- Every job receives a tenant, purpose, correlation identifier, and idempotency key.
- Retries are bounded and retryable failures are separated from permanent validation failures.
- Raw provider data is not exposed directly to the product interface.
- Normalized fields retain source and collection metadata.
- Plan enforcement and usage accounting occur on the server, not only in the interface.
- Exports and outbound events create auditable usage records.

## Software-delivery pipeline

```text
Issue / roadmap item
      │
      ▼
Small reviewed change
      │
      ▼
Type check ── tests ── production build ── secret/data scan
      │
      ▼
D1 migration review ── Worker dry run ── authenticated deployment
      │
      ▼
HTTPS smoke test ── auth journey ── trial-limit test ── health check
      │
      ▼
Logs + release ID + monitoring
      │
      ├── healthy ──► promote and record evidence
      └── failure ──► rollback to last known-good Worker version
```

### Quality gates

1. `npm ci` succeeds from a clean checkout.
2. Type checking, tests, and the production build pass.
3. No secret, private workflow, or live customer dataset enters the repository.
4. Schema changes are versioned and reviewed before remote migration.
5. The deployment is associated with a source commit and Cloudflare version.
6. The primary user journey passes on the custom domain.
7. A failed primary journey blocks promotion and triggers rollback.

## Release ownership

| Concern | Source of truth |
| --- | --- |
| Product scope and sequence | `docs/ROADMAP.md` |
| Runtime and data boundaries | `docs/ARCHITECTURE.md` |
| Build and test automation | `.github/workflows/ci.yml` |
| Cloudflare configuration | `wrangler.jsonc` |
| Database evolution | `migrations/` |
| Release and rollback procedure | `docs/DEPLOYMENT.md` |
| Security reporting and public boundaries | `SECURITY.md` |
