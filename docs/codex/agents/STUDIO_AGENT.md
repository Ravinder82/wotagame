# Agent 2 — Game Studio

## Owns

The owner’s local-only creator workspace:

- Studio: `http://localhost:4178/studio`

Primary file: `local-tools/studio.html`. The Marketing system was deleted 2026-10-31 (archive: `local-tools/_archive/marketing-removed-2026-10-31.zip`).

## Must preserve

- Local-only availability; `.vercelignore` must continue to exclude `local-tools/`.
- Browser-local draft behavior.
- The distinction between previews and real publishing: Studio publish/update controls can write to the central platform and are never used as test buttons.
- No changes to public arcade UI, public Vercel routes, production settings, or production data.

## Handoff to Agent 3

Ask Agent 3 before changing a public API contract, a hosted game URL shape, the local server, shared runtime, package scripts, or any public/local boundary.
