# ADR 001: Keep the public portfolio edition independent

- **Status:** Accepted
- **Date:** 2026-09-04

## Decision

Build the public Prospecta case study in a new repository with synthetic data and an independent commit history. Keep the operational application, customer data contracts, secrets, provider integrations, and automation exports private.

## Rationale

A sanitized copy of an operational repository can still expose deleted material through Git history and may preserve architecture details that are inappropriate for a public portfolio. A clean implementation makes the security boundary verifiable while still demonstrating product design, frontend engineering, cloud delivery, and system-design judgment.

## Consequences

- Public reviewers receive a focused and runnable project.
- No production credential or customer record is required to evaluate it.
- Product improvements can be ported deliberately instead of mirroring operational code automatically.
- The demo cannot claim to expose or measure production workloads.
