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
8. Confirm `RESEND_API_KEY` exists as a Worker secret and the sender domain is verified by the email provider before enabling verification-dependent registration.

## Release

Run `npm run deploy` from an authenticated environment. Record the deployed version identifier and source commit in the release notes. A plain-text bootstrap Worker is not an application release.

## Verification

1. Load the home page over HTTPS.
2. Create a trial account and confirm that the verification message is delivered without exposing its token in logs.
3. Verify the email, sign in, sign out, and sign back in.
4. Perform three searches and confirm the fourth is rejected server-side.
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

The Cloudflare zone, custom domain, certificate, D1 database, and Worker association are active. Migration `0002_identity_security.sql` adds verified identities, account states, revocable sessions, account tokens, consent, deletion requests, rate limits, and audit events. The application release must not be considered complete until transactional email is configured and the verification checklist above passes in production.
