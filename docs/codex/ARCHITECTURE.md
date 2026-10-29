# Architecture

## Stack
Vanilla HTML/CSS/JS; Node.js ES modules, Node >=20; Vercel serverless handlers; Neon PostgreSQL via `@neondatabase/serverless`. No framework/build pipeline.

## Important paths
- `index.html`: public arcade homepage.
- `game-runtime.js`, `lib/game-runtime.js`: shared game runtime/copy for server-rendered game page.
- `examples/wordfinder-puzzle/`: existing Word Finder example and poster.
- `local-tools/studio.html`, `WotaGame Control Center.command` (formerly `OPEN-STUDIO.command`): internal Creator Studio. The Marketing system was deleted 2026-10-31; archived at `local-tools/_archive/marketing-removed-2026-10-31.zip`.
- `server.mjs`: local static file server on port 4178; it does not run Vercel API functions.
- `api/games/index.js`: admin-only list and publish.
- `api/game.js`, `api/play.js`, `api/poster.js`: root handlers behind the `/api/games/:slug`, `/g/:slug`, `/api/poster/:slug` rewrites.
- `api/game.js`: root compatibility handler used by Vercel rewrite.
- `api/play.js`: read a published record and render game page + server-generated metadata.
- `api/poster.js`: serve stored poster PNG; root compatibility route.
- `api/play/[slug].js`, `api/poster/[slug].js`: nested handler paths retained in source.
- `lib/shared.js`: config validation, slugify, safe escaping, page rendering.
- `lib/db.js`: Neon connection and public base URL.
- `lib/auth.js`: constant-time bearer token validation.
- `schema.sql`: database schema.
- `vercel.json`: production builds/rewrites; do not casually restructure.
- `.vercelignore`: excludes `local-tools/`.

## Routes/API
- `POST /api/games`: bearer admin token required; config + PNG poster base64; creates a slug.
- `GET /api/games`: currently requires admin token; returns up to 50 published records.
- `GET /api/games/:slug`: public metadata for a published game.
- `PUT /api/games/:slug`: admin token required; updates config/poster while preserving slug.
- `/g/:slug` → `/api/play.js?slug=:slug`; HTML page has canonical, OG and X metadata.
- `/api/games/:slug` → `/api/game.js?slug=:slug`.
- `/api/poster/:slug` → `/api/poster.js?slug=:slug`, returns PNG.
- Slugs match `^[a-z0-9][a-z0-9-]{3,59}$`.
- Publisher currently accepts legacy game types reaction/higher/memory/wordfinder. The new catalog games aren't integrated into that old publisher yet.

## Database
`public.games`: `slug` primary key, `config jsonb`, `poster_base64`, `is_published`, `created_at`, `updated_at`; slug/config checks and indexes on update time/publication. Scores and personal bests are browser-local; there are no account/leaderboard tables.

## Vercel routing caveat
`vercel.json` has Node builds for `api/*.js` and `api/**/*.js`, includes `lib/game-runtime.js`, plus static builders for `index.html`, `game-runtime.js`, `examples/**/*`, `assets/**/*`. Root compatibility handlers are intentional. Preserve three rewrites for `/g/:slug`, `/api/games/:slug`, and `/api/poster/:slug`.
