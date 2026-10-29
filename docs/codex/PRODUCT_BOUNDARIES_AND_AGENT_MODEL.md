# WotaGame — Product Boundaries and Agent Model

Last verified: 2026-10-22.

This workspace contains two products. They share a repository and some platform code, but they must be planned, changed, and reviewed as separate products.

## Product 1 — WotaGame Arcade (public)

- **Purpose:** player-facing browser-game arcade.
- **Live address:** `https://wotagame.vercel.app/`.
- **Local preview:** `http://localhost:4178/`.
- **Audience:** players arriving from social posts or direct links.
- **Primary source:** `index.html`, `assets/`, `api/`, `lib/`, `game-runtime.js`, `vercel.json`, `schema.sql`, and `examples/`.
- **Public game invariant:** `/g/word-finder-puzzle-3be5f1` stays stable and playable. Picture Puzzle, Hailstorm Run, and Crossword remain Coming Soon until genuinely implemented and tested.
- **Deployment rule:** a local change is not live. Never deploy or change Vercel production settings without the owner’s explicit approval.

The working tree and the live Vercel site both serve the approved raster hero and social image as of the 2026-10-22 owner-approved deployment. A local change is not automatically live; re-verify before assuming they match again.

## Product 2 — WotaGame Game Studio (local creator workspace)

- **Purpose:** the owner’s private workspace for composing/testing/publishing game configurations. The Marketing (Post Studio) system was deleted on 2026-10-31; its code lives archived at `local-tools/_archive/marketing-removed-2026-10-31.zip`.
- **Studio:** `http://localhost:4178/studio`.
- **Audience:** the owner and internal collaborators only.
- **Primary source:** `local-tools/studio.html` (served at `/studio` on 4178).
- **Storage/behavior:** drafts stay in the browser; Studio can make real platform API writes when used with an admin token, so publishing is never a test action.
- **Publication rule:** `.vercelignore` excludes `local-tools/`; these pages must never be deployed as part of the public arcade.

## Correct local launch behavior

Run `npm start`, then open the HTTP URLs above. Do not use `file:///Users/ravinderpoonia/Developer/WotaGame/index.html` as an application launch target.

`file://` bypasses `server.mjs`. Root-relative asset paths such as `/assets/wotagame-hero.webp` resolve outside the project and fail, and Vercel API routes cannot run there. That is why the file tab showed alt text and a visually broken arcade. It did not remove Studio or its files.

When sharing a page with the owner, share the appropriate `http://localhost:4178/...` URL rather than a link to an HTML source file.

## Three-agent ownership model

### Agent 1 — Public Arcade owner

- Works only on Product 1: public game experience, public routes, public assets, Vercel functions, and release readiness.
- Does not modify `local-tools/`.
- Does not deploy without the owner’s explicit approval.
- Operating profile: [`agents/PUBLIC_ARCADE_AGENT.md`](agents/PUBLIC_ARCADE_AGENT.md).

### Agent 2 — Game Studio owner

- Works only on Product 2: `local-tools/studio.html` (port 4178), local creator workflows, drafts, and local-only usability.
- Does not modify public arcade UI, public game routes, Vercel settings, or production data.
- Treats Studio publishing controls as real writes, never as a casual verification step.
- Operating profile: [`agents/STUDIO_AGENT.md`](agents/STUDIO_AGENT.md).

### Agent 3 — Integration owner

- Owns only the shared boundary: `server.mjs`, `package.json`, `.vercelignore`, `vercel.json`, shared API contracts, shared runtime, and documented handoffs.
- Reviews and implements changes that affect both products, such as local launch paths, shared game configuration, API contracts, or production exclusion rules.
- Does not change a product’s user experience unless the work is explicitly cross-product.
- Operating profile: [`agents/INTEGRATION_AGENT.md`](agents/INTEGRATION_AGENT.md).

### Coordinator

The primary Codex agent routes every request to the appropriate owner, asks Agent 3 to assess cross-product effects, keeps this document and `PROJECT_MEMORY.md` current, and reports a single integrated result to the owner.

Agents are task roles, not unattended background processes. They are invoked for the relevant scope on each request, so work remains traceable and does not overlap across the shared working tree.
