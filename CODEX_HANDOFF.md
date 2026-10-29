# WotaGame — Codex Handoff

Open the existing `~/Developer/WotaGame` project. Do not scaffold a replacement. Read `AGENTS.md` and every file under `docs/codex/`; use `CODEX_START_PROMPT.md` only for the currently requested task.

## Product

WotaGame is a player-first browser-game arcade. Players open games on hosted webpages; social posts bring traffic to those pages. Do not claim games run inside the X timeline. The selected launch collection is Picture Puzzle, Hailstorm Run, Crossword, and Word Finder. Keep the first three Coming Soon until each is implemented and tested.

The repository also contains a separate, local-only product: WotaGame Game Studio. Its HTTP route is `/studio` (serving `local-tools/studio.html`); `.vercelignore` keeps `local-tools/` out of Vercel. The Marketing system was deleted on 2026-10-31 (archive: `local-tools/_archive/marketing-removed-2026-10-31.zip`). Read [`docs/codex/PRODUCT_BOUNDARIES_AND_AGENT_MODEL.md`](docs/codex/PRODUCT_BOUNDARIES_AND_AGENT_MODEL.md) before work that could cross the public/local boundary.

## Current implementation

- `index.html`: public catalog.
- `game-runtime.js` and `lib/game-runtime.js`: identical runtime used by hosted game pages.
- `api/`, `lib/`, and `schema.sql`: Vercel API, helpers, and Neon data model.
- `local-tools/studio.html`: internal tool. `.vercelignore` excludes `local-tools/`.
- `server.mjs`: static local server on port 4178; it does not execute Vercel functions or rewrites.
- The stable playable game is `/g/word-finder-puzzle-3be5f1`. The other three public cards remain Coming Soon.

## Verified audit findings (2026-10-22)

See [`docs/codex/PROJECT_MEMORY.md`](docs/codex/PROJECT_MEMORY.md) for full evidence and routes. The working tree now serves the extracted approved raster hero and social preview, and the local server maps PNG/JPEG/WebP files. On 2026-10-22, with explicit owner approval, the working tree was deployed to production and the `wotagame.vercel.app` alias was repointed to the new deployment; the live site now serves the approved raster art and no longer registers the obsolete missing `#viewAll` handler. See PROJECT_MEMORY for the full verification record and the remaining `.env` secret-retrieval gap.

## Infrastructure and safety

The verified Vercel project identity and official domain are recorded in project memory. Neon project details and prior alias notes in `docs/codex/VERCEL_NEON_OPERATIONS.md` are historical and should be rechecked before use. Source references `DATABASE_URL`, `STUDIO_ADMIN_TOKEN`, `APP_URL`, and `STUDIO_ORIGINS`; never read or expose their values. Do not deploy, change production environment/alias/security settings, or mutate database data without explicit owner approval. Preserve the Word Finder record and route, API contracts, shared runtime, and `vercel.json` rewrites.

The local Creator Studio is configured to publish through the central platform API; publishing can write production data. Do not use it as an audit smoke test. Scores are local-only; there are no accounts, cross-device saves, global leaderboard, or automatic social posting.

No `.git/` directory was present during the 2026-10-22 audit. Do not initialize a repository or assume history/remotes.
