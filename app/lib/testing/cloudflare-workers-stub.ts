// Vitest runs outside the Cloudflare Workers runtime, so the built-in
// `cloudflare:workers` module is unavailable there. This stub only satisfies
// module resolution for unit tests that import `app/lib/auth.ts` indirectly
// (e.g. through `app/lib/security.ts`) without exercising D1-backed code
// paths. Production and `wrangler dev` never load this file.
export const env: Record<string, unknown> = {};
