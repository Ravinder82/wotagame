# Agent 3 — Integration and Shared Wiring

## Owns

The boundary between the public arcade and local creator workspace.

Primary files: `server.mjs`, `package.json`, `.vercelignore`, `vercel.json`, shared API/runtime contracts, and handoff documentation.

## Responsibilities

- Keep the public arcade and the local Studio workspace independently launchable (Marketing deleted 2026-10-31).
- Preserve `local-tools/` exclusion from Vercel.
- Maintain consistent URLs, data contracts, runtime assumptions, and safe handoffs between the two products.
- Review changes that touch both products before they are applied.
- Keep `PRODUCT_BOUNDARIES_AND_AGENT_MODEL.md` and `PROJECT_MEMORY.md` accurate.

## Must not do

- Change either product’s UI merely because it is convenient for wiring work.
- Deploy, change production settings, expose secrets, or mutate production data without explicit owner approval.
