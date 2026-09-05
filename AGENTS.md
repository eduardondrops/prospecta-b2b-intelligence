# Prospecta — Agent operating guide

This file is the entry point for any coding agent working on Prospecta. Read it before changing code, infrastructure, schemas, authentication, permissions, or documentation.

## Product objective

Prospecta Worbita is a commercial Brazilian SaaS for people and small businesses that need to find targeted prospects, save leads, and run controlled automated outreach to sell their own services. The product must reduce prospecting time through geographic, business-area, segment, and field filters. Preserve the working product while evolving it into a secure individual-account SaaS without inventing capabilities, metrics, prices, or data rights.

## Repository topology

Prospecta is intentionally split into two repositories. Do not merge or copy them into one application without an approved architecture decision.

| Repository | Local folder | Production | Responsibility |
| --- | --- | --- | --- |
| `eduardondrops/prospecta-b2b-intelligence` | this repository | `https://prospectaworbita.site` on Cloudflare Workers | Landing page, registration, login, D1 identity, sessions, plans, usage limits, and restricted trial experience |
| `eduardondrops/captacao-frontend` | `D:\captacao-frontend` on the current workstation | `https://app.prospectaworbita.site` on Vercel | Original full platform, Supabase operational data, n8n integrations, Google/private-base search, history, lists, conversations, funnel, and related tools |

The access bridge is implemented by `app/api/original-access/route.ts` in this repository and `app/api/bridge/access/route.ts` in `captacao-frontend`.

## Non-negotiable product rules

1. Preserve the original `captacao-frontend` visual identity, navigation, names, pages, fonts, colors, and workflows unless the user explicitly authorizes a redesign.
2. Keep `prospectaworbita.site` and `app.prospectaworbita.site` independent in code and deployment.
3. Treat D1 as the source of truth for public accounts, password hashes, sessions, plans, trial expiration, and usage events.
4. Treat Supabase as the operational store used by the original full application. Never silently migrate or duplicate customer data between stores.
5. Never read, print, commit, or ask the user to paste passwords, password hashes, salts, service-role keys, API keys, tokens, or private customer data.
6. Do not change a user's plan, reset credentials, delete an account, run a remote migration, or alter production DNS without explicit authorization.
7. Trial permissions are enforced server-side: three days, three searches, and at most five results per search. A trial must be able to complete a useful search.
8. Trial, Essential, Growth, and Scale use the original full-platform interface. Plans differ through server-side quotas and entitlements, not by replacing the interface.
9. Public demo data in this repository is synthetic. Never present it as customer, revenue, conversion, or acquisition evidence.
10. Use only authorized business-data sources and retain provenance when live acquisition is introduced.
11. Preserve every original module: Google search, private-base search, history, lists, funnel, conversations, WhatsApp, campaigns, and automations. Plans control access and limits; they do not justify deleting modules.
12. The private source database belongs to the product owner and is always read-only/untouchable. Never migrate, update, delete, enrich in place, or run schema changes against it.
13. Automated outreach must include an explicit risk/responsibility notice, but a notice is not a substitute for rate limits, opt-out handling, audit logs, abuse prevention, and applicable LGPD/anti-spam controls.
14. Current commercial baseline: Essential at R$ 49,90/month with 15 leads/day and one connected WhatsApp; Growth at R$ 97,90/month with 45 leads/day and three connected WhatsApps; Scale is custom and requires commercial review. Daily limits reset at 00:00 in `America/Sao_Paulo`. Billing through Amplo Pay is planned, not implemented.
15. Trial users may work with at most 15 real leads across three days, connect one WhatsApp, save those leads, and send only after an explicit campaign confirmation. Do not connect a real data source or outbound channel until its authorization, cost, safety, and failure behavior are documented and tested.
16. Accounts are individual by default. Enterprise organizations, teams, roles, and custom limits require commercial and architecture approval.
17. The initial platform administrator is `eduardonunesdrops@gmail.com`. Administrative authority must be represented by a role/permission record and audit trail; never create or reset its password through handwritten SQL.
18. The intended transactional sender is `acesso@prospectaworbita.site`. Do not send production email until the domain, SPF, DKIM, DMARC, provider, templates, bounce handling, and unsubscribe/security behavior are verified.

## Sources of truth

- Product sequence and status: `docs/ROADMAP.md`
- Approved product definition: `docs/PRODUCT.md`
- User and delivery flows: `docs/PIPELINES.md`
- Runtime and data boundaries: `docs/ARCHITECTURE.md`
- Release/rollback procedure: `docs/DEPLOYMENT.md`
- Public-repository security boundary: `SECURITY.md`
- Cloudflare resources: `wrangler.jsonc` and `migrations/`
- Original platform behavior: the `captacao-frontend` repository and its `docs/ARQUITETURA-PROSPECTA.md`

When implementation and documentation disagree, verify production behavior and update both in the same change.

## Development workflow

### Public and access layer

```bash
npm ci
npm run dev
npm run check
```

Before a Cloudflare release, `npm run check` must pass. Deploy only with explicit authorization and follow `docs/DEPLOYMENT.md`.

### Original full platform

Run commands from `D:\captacao-frontend`:

```bash
npm ci
npm run dev
npm run build
```

Do not replace the original UI with the simplified Cloudflare workspace. Changes to the full platform require a production build and a focused regression check of its existing pages.

## Change procedure

1. Confirm which repository owns the requested behavior.
2. Inspect the current implementation and working-tree status before editing.
3. Preserve unrelated or untracked user files.
4. Make the smallest coherent change.
5. Add or update tests for permissions, limits, session boundaries, and transformations.
6. Run the repository quality gate.
7. Update roadmap, pipeline, architecture, or deployment docs when behavior changes.
8. Verify the affected user journey in production only after an authorized deployment.
9. Record what was verified and what still requires a user-owned credential or manual action.

## Definition of done

A change is complete only when the code builds, relevant tests pass, authorization and tenant boundaries remain enforced, documentation matches reality, no secret or private dataset entered Git, and the affected user journey has a clear verification result. A successful deployment alone is not sufficient.

## Current verified baseline

- `prospectaworbita.site` serves the public site, registration, login, account administration, and entitlement authority from Cloudflare Workers.
- Registration, logout, login, session restoration, and one restricted trial search were smoke-tested in production.
- Trial search returns at most five results and decrements the server-side allowance.
- `app.prospectaworbita.site` is attached to the original Vercel project.
- Every active verified plan requests a short-lived bridge token and is redirected to the original application; search quotas remain authoritative in D1.
- The end-to-end redirect for the owner's real account requires a user-performed login test because agents must not know or reset the password.

## Before starting a new feature

Create or update an issue/roadmap item with: user problem, affected plan, repository owner, data source, authorization boundary, success criteria, failure behavior, observability, rollout, and rollback. If a decision changes repository ownership, identity, storage, billing, or the original interface, add an ADR under `docs/adr/` before implementation.
