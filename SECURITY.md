# Security and privacy

## Supported version

Only the current default branch is maintained.

## Reporting

Please report vulnerabilities privately to the repository owner through GitHub. Do not open a public issue containing credentials, personal data, or an exploitable proof of concept.

## Public-demo guarantees

- Company names and attributes are synthetic.
- No production database or workflow is connected.
- No API key, customer identifier, personal email, or phone number is required.
- The demo writes no prospect data to persistent storage.

## Production controls represented by the architecture

- Server-side authorization and tenant isolation.
- Secret management through platform bindings.
- Strict input validation and output minimization.
- Request correlation, structured logs, and auditable state transitions.
- Bounded retries, timeouts, idempotency, and provider rate-limit handling.

## Contributor checklist

Before publishing a change, scan the diff for tokens, URLs, emails, phone numbers, raw provider responses, workflow exports, and customer-specific terminology. Use synthetic fixtures for every public example.
