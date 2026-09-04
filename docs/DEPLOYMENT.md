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
4. Review the generated Worker configuration with a Wrangler dry run when infrastructure changes.
5. Confirm the custom domain still belongs to the intended Cloudflare account.

## Release

Run `npm run deploy` from an authenticated environment. Record the deployed version identifier in the release notes.

## Verification

1. Load the home page over HTTPS.
2. Search for a company and apply a segment filter.
3. Add and remove a shortlist item.
4. Request `/api/health` and verify the service reports `status: ok`.
5. Inspect Cloudflare logs for server errors.

## Rollback

Use the Cloudflare Workers version history to restore the last known-good deployment, then repeat the verification checklist. Do not fix forward while an active release is serving a broken primary journey.
