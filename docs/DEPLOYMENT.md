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

## Release

Run `npm run deploy` from an authenticated environment. Record the deployed version identifier and source commit in the release notes. A plain-text bootstrap Worker is not an application release.

## Verification

1. Load the home page over HTTPS.
2. Create a trial account and confirm the authenticated workspace opens.
3. Sign out and sign back in.
4. Perform three searches and confirm the fourth is rejected server-side.
5. Request `/api/health` and verify the service reports `status: ok`.
6. Inspect Cloudflare logs for server errors.
7. Confirm the custom domain serves the same release as the Workers.dev route.

## Rollback

Use the Cloudflare Workers version history to restore the last known-good deployment, then repeat the verification checklist. Do not fix forward while an active release is serving a broken primary journey.

## Current incident note

The Cloudflare zone, custom domain, certificate, D1 database, and Worker association are active. The only deployed Worker version is the provisional bootstrap handler, which returns a preparation message instead of the application interface. Resolution requires an authenticated upload of the generated application bundle followed by the verification checklist above.
