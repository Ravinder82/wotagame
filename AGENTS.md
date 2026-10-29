# WotaGame — Codex Project Instructions

Read `CODEX_HANDOFF.md` and `docs/codex/` before architectural changes. Keep `docs/codex/PROJECT_MEMORY.md` current from inspected source and verified results; distinguish current facts from historical notes.

## Product direction
- Player-first browser-game arcade, not a public game-creator SaaS.
- Production: https://wotagame.vercel.app/
- Four curated public games: Picture Puzzle, Hailstorm Run, Crossword, Word Finder.
- Word Finder is the only game confirmed playable. Keep the other three marked Coming Soon until built and tested.
- Creator Studio (`/studio` on 4178) is a local/internal tool under `local-tools/`; never publish it. The Marketing (Post Studio) system was deleted 2026-10-31 and lives archived at `local-tools/_archive/marketing-removed-2026-10-31.zip`.
- Social posts drive traffic to hosted game pages. Do not claim games play inside X's timeline.

## Two-product boundary
- Treat the workspace as two separate products. The canonical details and agent model are in `docs/codex/PRODUCT_BOUNDARIES_AND_AGENT_MODEL.md`.
- **Product 1 — Public Arcade:** the player-facing Vercel app at `https://wotagame.vercel.app/`, with local preview at `http://localhost:4178/`.
- **Product 2 — Studio and Marketing:** the owner’s local-only creator workspaces: Arcade preview + Game Studio at `http://localhost:4178/` (`server.mjs`, Studio at `/studio`), and Marketing/Post Studio isolated at `http://localhost:4179/` (`server-marketing.mjs`, app at `local-tools/marketing/index.html`). Marketing was moved off 4178 on 2026-10-27; the two servers never serve each other's routes.
- A `file:///.../index.html` browser tab is not a valid app launch target. It bypasses the local server and breaks root-relative assets and Vercel routes.
- When giving the owner a local web link, always provide the relevant `http://localhost:4178/...` URL. Do not present a source-file link as an application preview link.
- Never publish `local-tools/`. Keep `.vercelignore` protecting it.

## Agent ownership model
- **Agent 1 — Public Arcade:** works only on Product 1 public experience, public assets/routes, Vercel functions, and deployment readiness. It never edits `local-tools/` or deploys without approval.
- **Agent 2 — Game Studio:** works only on `local-tools/` and local creator workflows. It never changes public arcade UX, Vercel configuration, or production data.
- **Agent 3 — Integration:** owns shared boundaries only: `server.mjs`, `package.json`, `.vercelignore`, `vercel.json`, shared runtime/API contracts, and handoff documentation. It handles cross-product changes.
- Use the corresponding operating profiles in `docs/codex/agents/` whenever delegating work to these roles.
- The primary agent coordinates these roles, keeps product boundaries explicit, and prevents overlapping edits in the shared working tree.

## Visual quality
- The user rejects generic/cheap AI-slop, placeholder art, rough SVG illustrations as final hero artwork, and Canva dependency.
- Use polished, cinematic, game-focused raster art with deliberate composition, lighting and color grading.
- Hero target: an ensemble/lineup poster for the four game worlds; do not make a controller, generic person or dog the primary subject.
- Current brand assets are integrated at `assets/wotagame-hero.webp` (1800×749) and `assets/wotagame-social.jpg` (1200×630), built 2026-10-29 with the lime ✳ WotaGame mark (`assets/favicon.png` is the site icon). Source archive of the older approved art: `assets/wotagame-hero-assets.zip`; previous `xpc-hero.webp`/`xpc-social-preview.jpg` kept for rollback.
- Keep `index.html` and social metadata pointed at those real filenames. Verify visually before claiming future visual changes are fixed.
- Never replace separate game thumbnails with one generic hero crop. Generate/approve game-specific raster art one by one.
- Do not use Canva or claim an image is integrated unless its actual file exists and visibly renders.

## Engineering and data safety
- Stack: vanilla HTML/CSS/JS, Node ESM (Node >=20), Vercel functions, Neon PostgreSQL. Avoid large dependencies/frameworks unless approved.
- Preserve stable Word Finder route `/g/word-finder-puzzle-3be5f1`, its database record, shared runtime, API contracts, and explicit `vercel.json` rewrites.
- Keep `local-tools/` out of production via `.vercelignore`.
- Scores are local-only. No accounts, global leaderboard, cross-device save, analytics or auto-posting currently exist.
- Never print/commit `DATABASE_URL` or `STUDIO_ADMIN_TOKEN`; never expose values from `.env.local` or `.vercel/`. Document variable names only.
- No destructive DB actions, production environment changes, alias changes, or production deployment without explicit owner approval.
- No `.git/` directory was present at last inspection. Do not assume Git history/remotes or initialize/push without asking.

## Test and verification policy
- Short, quick-running checks are allowed when useful, including `npm run check`, TypeScript checks, syntax checks, lint checks, and focused error checks.
- Do not run long-running test suites, end-to-end suites, smoke-test matrices, load tests, or broad validation workflows unless the owner explicitly asks.
- For ordinary feature work, leave full behavioral testing to the owner's manual and visual review.
- After fixing an identified error, bug, or issue, focused checks for the affected behavior are allowed.

## Workflow
1. Read `CODEX_HANDOFF.md` and `docs/codex/`.
2. Run `bash scripts/codex-preflight.sh`.
3. Inspect desktop and mobile views in a real browser.
4. Follow the Test and verification policy; run checks only when the owner requests them or when verifying a fixed error, bug, or issue.
5. Report exact changed files, tests, visual results, open risks, and whether production actually deployed.
