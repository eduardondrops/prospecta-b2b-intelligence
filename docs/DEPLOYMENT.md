# Deployment runbook

## Environments

- **Local:** `npm run dev`
- **Local Worker preview:** `npm run preview`
- **Production:** Cloudflare Worker `prospecta-b2b-intelligence`
- **Custom domain:** `prospectaworbita.site`

## Pre-release checks

1. Run `npm ci` from a clean checkout.
2. Run `npm run check`.
3. Confirm that no secret or live dataset was introduced.
4. Apply pending D1 migrations to the target environment.
5. Review the generated Worker configuration with a Wrangler dry run when infrastructure changes.
6. Confirm the custom domain still belongs to the intended Cloudflare account.
7. Confirm Wrangler is authenticated with the intended Cloudflare account.
8. Confirm `RESEND_API_KEY` exists as a Worker secret and the sender domain is verified by the email provider before enabling verification-dependent registration. Wrangler declares this secret as required and must reject a release when it is absent.

## Release

When a bridge contract changes, publish in this order: deploy a compatible preview of `captacao-frontend`, apply the D1 migration, deploy the Cloudflare Worker, promote the verified Vercel build, then run the full journey. For Worker-only changes, run `npm run deploy` from an authenticated environment. Record both deployed version identifiers and source commits in the release notes.

## Verification

1. Load the home page over HTTPS.
2. Create a trial account and confirm that the verification message is delivered without exposing its token in logs.
3. Verify the email and confirm that the verification response creates the session and opens the original dashboard automatically.
4. Perform three searches across Busca Google and Base Privada and confirm the fourth is rejected server-side.
5. Open `/conta/seguranca`, list the active sessions, and revoke a non-current session.
6. Sign in as the verified owner account, open `/admin`, and change the plan and state of a disposable test account.
7. Confirm that the administrative change and session revocation appear in `audit_events` without secrets or password material.
8. Exercise password recovery and confirm the single-use reset link expires as documented.
9. Request `/api/health` and verify the service reports `status: ok`.
10. Inspect Cloudflare logs for server errors and sensitive data.
11. Confirm the custom domain serves the same release as the Workers.dev route.

## Rollback

Use the Cloudflare Workers version history to restore the last known-good deployment, then repeat the verification checklist. Do not fix forward while an active release is serving a broken primary journey.

## Phase 1 release state

The Cloudflare zone, custom domain, certificate, D1 database, Worker association, and Resend secret are active. Migration `0002_identity_security.sql` adds verified identities and account controls; `0003_operational_access.sql` adds hashed bridge tokens used to enforce search quotas from the original interface. The application release is complete only after both deployments and the verification checklist pass in production.
