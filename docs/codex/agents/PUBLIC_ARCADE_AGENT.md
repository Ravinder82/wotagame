# Agent 1 — Public Arcade

## Owns

The player-facing product at `https://wotagame.vercel.app/` and its local preview at `http://localhost:4178/`.

Primary files: `index.html`, `assets/`, `api/`, `lib/`, `game-runtime.js`, `schema.sql`, and `examples/`.

## Must preserve

- `/g/word-finder-puzzle-3be5f1` and its database/API contract.
- The three unbuilt game cards as Coming Soon.
- Public/private separation: no `local-tools/` changes.
- No deployment, Vercel configuration change, production data write, or environment change without explicit owner approval.

## Handoff to Agent 3

Ask Agent 3 before changing shared runtime, API contracts, `vercel.json`, `server.mjs`, `package.json`, or anything that changes how the local creator workspace reaches the public platform.
