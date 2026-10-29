# WotaGame — Project Memory

Last verified: 2026-10-23. This record reflects the current working tree and read-only browser checks of the live site. Historical hosting notes are identified as unverified where applicable.

## 2026-10-23 Post Studio separation (local only, no deploy)

- Owner directive: separate Studio (game generation/publish/ZIP/test) from Marketing, and rebuild Marketing as the seed of an interactive-post SaaS based on X's `twitter:player` card mechanic (newsletter signup inside the timeline; proven live by Tibo's card, verified from the owner's screen recording). Phase 1 approved: Newsletter widget fully built, Game promo kept as a category, Quiz visible stub. Phase 2 (real card hosting at `/c/[slug]`, Neon, provider webhooks) is planned, not built.
- `local-tools/marketing/index.html` (then at `local-tools/marketing.html`) rewritten as "Interactive Post Studio" (categories rail: Newsletter / Game promo / Interactive quiz; live desktop-timeline + mobile-70/30 simulators; tweet-copy hooks; 640×480 poster canvas; card ZIP export). Game-promo capability unchanged.
- `local-tools/studio.html` trimmed to game scope: removed post-copy field/copy/share affordances; publish flow, ZIP export, metadata, checklist, and runtime preview untouched. Renamed to "WotaGame Game Studio" / "Post studio ↗" link.
- `server.mjs` gained additive local-only routes: `POST /__xpc/subscribe`, `GET /__xpc/subscribers`, `POST /__xpc/card`, `GET /__xpc/card/preview` (with X frame-ancestors CSP), `GET /__xpc/card/preview/poster.png`; state files under `local-tools/.data/` (subscribers.json, card-preview.html, card-poster.png). No production route or contract touched.
- Verified in browser 2026-10-23: zero console errors on `/marketing` and `/studio`; subscribe flow end-to-end (iframe → server → file, 3 test subscribers stored locally); mobile 70/30 toggle; category switching; Studio regression clean (postText field absent, publish/export/metadata present). `npm run check` passes.
- Nothing was deployed; production and the database were untouched.

## 2026-10-23 Phase 2: hosted card hosting (local-first, no deploy)

- Owner directive: Phase 2 begun — real card hosting at `/c/[slug]` with Neon provider webhooks, local-first so the full loop is testable before any deploy. No production deploy and no Neon schema run without explicit owner approval (local `DATABASE_URL` is placeholder-only).
- `lib/cards.js` created (pure ESM, shared by Vercel functions and local server): `isValidCardSlug`, `normalizeCardConfig` (newsletter clamps: brand/handle/badge/headline/sub/accent/btnLabel/footer/success/hook/webhook), `cardSlugify`, `esc`, `headlineHtml` (`*stars*`→`<em>`), `cardTweetText`, `renderCardPage({slug,config,baseUrl})` — full standalone player-card page with `twitter:card=player` (640×480), `twitter:image`, og tags, CSP-friendly CSS, `fetch()` subscribe (no `<form>`), postMessage `{type:"xpc:nl"}` relay to parent.
- `schema.sql` appended: `public.cards` (slug PK, kind `newsletter|quiz`, config JSONB, poster_base64, is_published, indexes, CHECK constraints) and `public.card_subscribers` (card_slug FK ON DELETE CASCADE, email, list_name, source, UNIQUE card_slug+email+list_name). Not yet run against Neon.
- `api/cards/index.js` created: GET admin list (subscriber_count subquery, url=`/c/:slug`, posterUrl), POST admin create (normalizeCardConfig, poster ≤1.2MB base64 PNG magic check, slug=`cardSlugify(brand)-randomBytes(3)`).
- `api/cards/[slug].js` created: GET public metadata, PUT admin update (same poster validation).
- `api/cards/[slug]/subscribe.js` created: POST public (no bearer — hit by X's iframe), validates card exists+published, inserts with `ON CONFLICT DO NOTHING` → `already:true`, optional webhook forward via `fetch` with ~5s AbortController timeout → `forwarded` flag.
- `api/cards/[slug]/poster.js` created: GET/HEAD PNG from poster_base64.
- `api/card-page.js`, `api/card.js`, `api/card-subscribe.js`, `api/card-poster.js` created: root compatibility handlers used by `vercel.json` rewrites.
- `vercel.json` updated: new routes `^/c/:slug`→card-page, `^/api/cards/:slug/subscribe`→card-subscribe, `^/api/cards/:slug/poster`→card-poster, `^/api/cards/:slug`→card; `includeFiles` now adds `lib/cards.js`, `lib/db.js`, `lib/auth.js` to both build blocks.
- `server.mjs` updated: local file-backed mirror under `local-tools/.data/` (cards.json, card-subscribers.json) with GET/POST `/api/cards`, GET/PUT `/api/cards/:slug`, POST `/api/cards/:slug/subscribe` (webhook forward), GET `/api/cards/:slug/poster`, GET `/c/:slug` (renderCardPage + frame-ancestors CSP) — reuses `lib/cards.js` since the static server has no Vercel rewrites.
- `local-tools/marketing.html` updated: Newsletter Publish panel added — platform target select (Local / Live `https://wotagame.vercel.app`), token field (≥32 chars, session-only, never persisted), Publish new card / Update published card buttons (POST/PUT `{config,posterBase64}` → store `nl.slug` + `nl.url=base+/c/+slug`), subscriber count refresh, "Open hosted card" opens the `/c/` URL, one-click X composer retained per owner directive, ZIP export retained as hedge. Hosted mode preview loads the real `/c/` card in the iframe.
- Verified locally 2026-10-23: `npm run check` passes on all new/edited files; `/marketing` and `/studio` zero console errors; full e2e loop via curl and browser — create card (slug `owner-test-weekly-49fadf`), card page loads with CSP + twitter:player meta, subscribe through the card → "Subscribed ✓" + count persisted, PUT update (brand/headline/hook all changed), duplicate-email → `already:true`, invalid email → 400, local-target publish → returns hosted URL + subscriber count display.
- Nothing was deployed; production, Neon database, and `.env` were untouched.

## 2026-10-22 deployment update (owner-approved)

- The owner explicitly approved a production deployment. The working tree was deployed with `vercel --prod --yes` (deployment `dpl_A2G9N1L1t2q1E1EbHrgvUmc3qaQj`, URL `wotagame-kt1pju1r4-ravinder82s-projects.vercel.app`).
- The official domain `wotagame.vercel.app` was a pinned alias on the previous deployment (`dpl_2d5XmQmZ87wX4KrWzUbhfoa8VD7a`). The alias was repointed to the new deployment with `vercel alias set`; this was also owner-approved in the same request.
- Live verification after the alias move: homepage 200; `/assets/xpc-hero.webp` 200 (`image/webp`); `/assets/xpc-social-preview.jpg` 200 (`image/jpeg`); all four per-game card WebPs 200; `/g/word-finder-puzzle-3be5f1` 200; `/api/poster/word-finder-puzzle-3be5f1` 200 (`image/png`); `/local-tools/studio.html` and `/local-tools/marketing.html` 404 (correctly excluded). Open Graph and X `og:image`/`twitter:image` point at `xpc-social-preview.jpg`.
- The homepage no longer references `arcade-hero.svg` or `arcade-social.png`; production now matches the verified working tree.
- Environment variables: `vercel env pull .env --environment=production` wrote non-secret values (`APP_URL`, `STUDIO_ORIGINS`, and `VERCEL_*` system values) into a local `.env`. `DATABASE_URL` and `STUDIO_ADMIN_TOKEN` are stored as encrypted Vercel secrets; the CLI wrote `[SENSITIVE]` placeholders and cannot return their values. Real values must be read from the Vercel dashboard or regenerated. `.gitignore` already covers `.env`.
- The Vercel account has three projects: `wotagame`, `appgrowth-ai`, `driftzz-website`. The `wotagame` project's registered domain is `wotagame.vercel.app`; the documented official domain `wotagame.vercel.app` exists only as a deployment alias, not a project domain. Re-check before relying on either name.

## Product and scope

This workspace contains two distinct products. Their full boundary and ownership model is maintained in [`PRODUCT_BOUNDARIES_AND_AGENT_MODEL.md`](PRODUCT_BOUNDARIES_AND_AGENT_MODEL.md).

1. **WotaGame Arcade (public):** a player-first browser-game arcade at `https://wotagame.vercel.app/`. The public site sends players to standalone game pages; social links promote those pages and do not embed gameplay in X. The four selected games are Picture Puzzle, Hailstorm Run, Crossword, and Word Finder. The first three remain Coming Soon. Only Word Finder is currently implemented and verified playable.
2. **WotaGame Studio and Marketing (local):** private browser tools: Studio at `http://localhost:4178/studio` and Marketing isolated at `http://localhost:4179/` and excluded from Vercel deployment.

The public live app, its local preview, and the local Studio/Marketing workspace are separate browser targets. `file:///Users/ravinderpoonia/Developer/WotaGame/index.html` is not a valid app launch target because it bypasses the local HTTP server and breaks root-relative asset paths.

## Runtime and commands

- Vanilla HTML/CSS/JS, Node.js ES modules, Vercel serverless functions, and Neon PostgreSQL through `@neondatabase/serverless`.
- `package.json` requires Node >=20. Audit runtime: Node v26.8.2; npm v11.19.1. Lockfile resolves `@neondatabase/serverless` 1.2.0.
- `npm start` runs `node server.mjs`; `npm run dev` runs the same static server. `npm run check` runs Node syntax checks listed in `package.json`.
- No build step, test script, or test/spec files were found. Dependencies were already installed; no install was run.
- `bash scripts/codex-preflight.sh` is read-only and reports project identity, key-name presence only, asset bundle contents, and deployment exclusions.

## Source map and boundaries

- `index.html`: public catalog, hero, search, and client-side navigation.
- `assets/`: four per-game SVG thumbnails, older SVG hero and PNG social image, the source bundle `wotagame-hero-assets.zip`, and extracted approved `xpc-hero.webp` (1800×749) plus `xpc-social-preview.jpg` (1200×630).
- `game-runtime.js` and `lib/game-runtime.js`: identical shared game runtime. `lib/shared.js` validates config and renders the standalone game page with escaped metadata and inline runtime.
- `api/`: Vercel handlers for publishing/listing games, public metadata, standalone game pages, and PNG posters. Root compatibility handlers are intentionally used by `vercel.json` rewrites while nested handler files remain in source.
- `lib/db.js`, `lib/auth.js`: Neon connection and bearer-token check. `schema.sql`: `public.games` table and indexes.
- `examples/wordfinder-puzzle/`: standalone/export example, poster, copy, and Vercel config.
- `local-tools/studio.html` and `local-tools/marketing/index.html`: internal browser tools; `.vercelignore` excludes `local-tools/`.
- `server.mjs`: static file server bound to `127.0.0.1:4178`; it does not run Vercel functions or rewrites.

## Local pages and routes

The project server was not running at audit start. `npm start` was launched and is still running on port 4178.

- `http://localhost:4178/` — HTTP 200.
- `http://localhost:4178/local-tools/studio.html` — HTTP 200.
- `http://localhost:4178/local-tools/marketing.html` — HTTP 200.
- The local server is static only; Vercel API handlers and `/g/:slug` rewrites are not available through it.

At the time of the browser check, the default desktop viewport was 1321×844 and the narrow viewport was 390×844. The home page, Studio, Marketing, and Word Finder had no horizontal overflow at the inspected widths. Studio and Marketing rendered in both mobile and desktop layouts.

## Vercel routes and data

`vercel.json` builds `api/*.js` and `api/**/*.js` with `@vercel/node`, includes `lib/game-runtime.js`, and serves `index.html`, `game-runtime.js`, `examples/**/*`, and `assets/**/*` as static files. Preserve these rewrites:

- `/g/:slug` → `/api/play.js?slug=:slug` (standalone HTML with canonical, Open Graph, and X metadata).
- `/api/games/:slug` → `/api/game.js?slug=:slug`.
- `/api/poster/:slug` → `/api/poster.js?slug=:slug` (PNG).

`POST /api/games` creates a published record and `PUT /api/games/:slug` updates one; both require the admin bearer token. `GET /api/games` also requires that token. `GET /api/games/:slug` returns public metadata. Slugs are limited to `^[a-z0-9][a-z0-9-]{3,59}$`.

`public.games` stores `slug`, JSONB `config`, base64 PNG poster, publication state, and timestamps. The API uses parameterized Neon queries and reads `DATABASE_URL`; `APP_URL` sets canonical public URLs. `STUDIO_ADMIN_TOKEN` protects writes, and `STUDIO_ORIGINS` adds allowed browser origins. Scores and personal bests are local browser storage; there are no account or leaderboard tables.

## Hosting identity and environment notes

- `.vercel/project.json` identifies project `wotagame`, project ID `prj_dB44QYXaKqFbwf1M67daFlin7Xr0`, and org ID `team_jw1VrzB3HC36tmTRZd7DQUh8`.
- Official domain `https://wotagame.vercel.app/` returned HTTP 200. The current alias target and production environment configuration were not verified.
- Source references environment-variable names `DATABASE_URL`, `STUDIO_ADMIN_TOKEN`, `APP_URL`, and `STUDIO_ORIGINS`. A key-name-only check found none of these names in `.env.local`; this does not establish whether they are configured in Vercel. No environment values or private `.vercel` files were read.
- Neon project/database identifiers in `VERCEL_NEON_OPERATIONS.md` are historical handoff details, not verified against Neon during this audit.
- No `.git/` directory is present. No branch, remote, or history is assumed.

## Game and internal-tool status

- **Word Finder:** stable public route `/g/word-finder-puzzle-3be5f1`. The live page returned 200, rendered its 10×10 grid and all eight word targets, and its Hint action displayed a starting coordinate. The page fit at 390px and desktop widths. Canonical and social image metadata point to the route and its PNG poster. The poster endpoint returned 200 with `image/png`.
- **Picture Puzzle, Hailstorm Run, Crossword:** catalog cards are disabled and labeled Coming Soon. Their current artwork is separate SVG art, not approved raster thumbnails.
- **Creator Studio:** legacy publisher for Reaction Rush, Higher/Lower, Memory Match, and Word Finder. It can publish/update via the central platform API using a bearer token and export standalone game ZIPs. Its default platform URL is production; publishing is a real database write. Do not use it for audit smoke tests.
- **Marketing:** local copy/preview workspace for X and Instagram, with canvas-based exports at 1200×630, 1080×1080, and 1080×1920. Drafts use browser `localStorage`; it can import the Studio draft. It does not auto-post.

## Verified issues and browser results

- The working-tree homepage now references `/assets/xpc-hero.webp` and `/assets/xpc-social-preview.jpg`; both extracted files load locally at their expected dimensions. Their copies in the temporary setup pack matched the ZIP entries by SHA-256, so no extra copies were needed.
- Open Graph and X metadata now point at `/assets/xpc-social-preview.jpg`. Local `server.mjs` now maps PNG/JPEG/WebP MIME types, and the local server was restarted after the change.
- The live deployment differs from the working tree: it loads `/assets/arcade-hero.svg`, an older illustration centered on a controller and dog. Its Open Graph/X metadata also point to `arcade-social.png`. The approved WebP/JPEG URLs return 404 in production. Do not claim the approved raster art is live.
- The local homepage previously logged `TypeError: Cannot read properties of null (reading 'addEventListener')` at inline `index.html:231` because `#viewAll` is not in the markup. The obsolete listener has now been removed from the working tree, and the local homepage search interaction works again. Production still contains the old handler until a later approved deployment; mobile navigation on production remains unverified after this fix.
- Production homepage and Word Finder returned 200. The poster returned 200 (`image/png`). Production `/local-tools/studio.html` and `/local-tools/marketing.html` both returned 404, as intended.
- Local homepage, Studio, and Marketing returned 200. The local broken hero URL returned 404; existing `/assets/arcade-social.png` returned 200 with the incorrect local MIME type.
- The live Word Finder page had no page-specific console errors in the inspected browser session. The homepage error appeared on both local and production pages.

## Checks and safety

- `bash scripts/codex-preflight.sh` — passed; no credentials printed.
- `npm run check` — passed.
- `node --check api/game.js`, `api/play.js`, and `api/poster.js` — passed. These root compatibility handlers are not covered by the package check script.
- No database writes, migrations, production setting changes, or deploys were performed. The live database record was not directly queried.

## Recommended next steps

1. ~~Deploy the already-fixed homepage handler only with owner approval, then verify production search, mobile navigation, share link, and year initialization.~~ **Done 2026-10-22** — deployed and alias repointed; production now matches the working tree. Residual: mobile navigation on production was not re-verified in a real mobile browser after the fix.
2. ~~Visually review the integrated raster hero/social preview at desktop and mobile sizes.~~ Partially done — assets verified loading over HTTP with correct dimensions and MIME types; a visual owner review is still worthwhile.
3. Create and approve distinct raster thumbnails for each game one at a time. Keep each game's art independent; do not reuse a hero crop. The current per-game card images are WebP renders of the SVG sources, not approved raster art; the approved archive contains only the hero and social preview.
4. Add focused browser smoke coverage for the homepage interactions, image paths/MIME types, stable Word Finder route, and production exclusion of local tools. The current package has syntax checks only.
5. Retrieve or regenerate the encrypted `DATABASE_URL` and `STUDIO_ADMIN_TOKEN` values and complete the local `.env` (placeholders only from `vercel env pull`).

## 2026-10-27 — Three-workspace split + X share removal (local only, no deploy)

Owner directive: delete the homepage X Share button and all its X connections; split the project into three clean isolated workspaces; plan before executing. REA MCP was offered for node-graph reasoning but not needed — the graph was derived from source.

**Workspace 1 — Public arcade (`https://wotagame.vercel.app`).**
- `index.html`: removed the "Your next friendly rivalry starts with one tap. Share the arcade ↗" X intent button and ALL of its connections (share-strip "Share on X" item → "Free to play / No downloads, no sign-ups", kicker "Play. Share." → "Play. Beat.", tiny-banner trailing "Share on X.", proof-item "Share on X & Instagram" → "Beat your bests together", footer Share intent link → internal "Play now", removed `shareUrl` + `#shareArcade` assignment in inline JS). Strip CTA is now an internal link: Play Word Finder ↗ → `/g/word-finder-puzzle-3be5f1`.
- Kept deliberately: `twitter:card/title/description/image` meta tags and `lib/shared.js` game-page meta (bot-consumed link-preview metadata, not user-facing forwarding). Owner may want these removed too — flagged.
- Local-only until an approved deploy; production still serves the old page.

**Workspace 2 — Local Arcade preview + Game Studio (`localhost:4178`, `server.mjs`).**
- Serves only: `/` (control-center), `/__xpc/arcade` (public-site preview iframe), `/studio`, static files, `POST /__xpc/publish` + status (real `vercel --prod` deploy).
- Removed all marketing/card endpoints: `/marketing`, `/__xpc/subscribe*`, `/__xpc/card*`, `/api/cards*`, `/c/:slug`. Control Center now has 2 tabs (Arcade, Studio) and says Marketing lives in its own workspace.

**Workspace 3 — Marketing / Post Studio only (`localhost:4179`, new `server-marketing.mjs`).**
- New Node ESM server (MARKETING_PORT env, default 4179). Static root = `local-tools/marketing/` (app moved from `local-tools/marketing.html` to `local-tools/marketing/index.html`).
- Carries all interactive-card endpoints: `/__xpc/health`, `/__xpc/subscribe`, `/__xpc/subscribers`, `/__xpc/card` (+`/preview`, `/preview/poster.png`), full hosted-card mirror (`GET/POST /api/cards`, `GET/PUT /api/cards/:slug`, `POST /api/cards/:slug/subscribe` with optional webhook forward, `/:slug/subscribers`, `/:slug/poster`, `GET /c/:slug` with frame-ancestors CSP). Data files live in `local-tools/marketing/.data/`.
- Cross-workspace localStorage (`xminigame.draft`) no longer readable cross-port → "Sync studio draft" button removed from Post Studio. Studio's "Post studio ↗" and Post Studio's "Arcade Studio ↗" are now plain `window.open` external links between the two ports.
- `package.json`: added `npm run start:marketing`. `OPEN-MARKETING.command` starts 4179 + opens it; `OPEN-STUDIO.command` opens the 4178 dashboard.

**Verification (2026-10-27):** `npm run check` clean. Isolation matrix via curl: 4178 serves arcade/studio assets but 404s every marketing/card route; 4179 serves marketing + card routes but 404s `/studio`, `/game-runtime.js`, `/__xpc/arcade`. Full local card loop on 4179 passed by curl and in-browser (publish → `/c/:slug` with CSP + `twitter:player` meta → subscribe → dedupe/invalid/forward/count). UI publish created exactly one card per click. Test data cleaned; owner subscriber `ravinder1294poonia@gmail.com` preserved in `subscribers.json`. Headless screenshots verified: Post Studio standalone page at 4179, Control Center 2-tab dashboard with X-free arcade preview.

**Not done (needs owner action):** production deploy of the X-share-free `index.html`; no schema or env changes; production still shows the old share strip until then.

## 2026-10-31 — Marketing subsystem deleted + MacBook/workspace renamed (no deploy pending)

Owner directive (verbatim intent): remove 4179 entirely from the local dashboard; rename the MacBook app/folder to the new brand; modify local 4178 to the new name; delete Marketing entirely from the local app state; change the GitHub repo name to the website name.

**Marketing deletion (verified):**
- Archived first (rollback-safe): `local-tools/_archive/marketing-removed-2026-10-31.zip` = the full Post Studio app (`local-tools/marketing/`, incl. draft data), `server-marketing.mjs`, `OPEN-MARKETING.command`, `docs/codex/MARKETING_WORKSPACE.md`.
- Deleted from the tree: the folders/files above plus the hosted-card API layer (`api/card.js`, `api/card-page.js`, `api/card-subscribe.js`, `api/card-poster.js`, `api/cards/`, `lib/cards.js`), so production deploys 4 functions (games only) — under the 12-cap with headroom. `vercel.json` no longer routes `/c/:slug` or `/api/cards/*`. `package.json` lost `start:marketing`; check script dropped the deleted files.
- `control-center.html` copy no longer mentions Marketing/4179; `studio.html` lost the "Post studio ↗" button + handler; stale comment in `server.mjs` replaced; port 4179 server killed, its log removed; `/marketing` 404s on 4178.
- Production verified: `https://wotagame.vercel.app/api/cards/nonexistent` now 404 (marketing endpoints gone from prod after redeploy); homepage + `/g/word-finder-puzzle-3be5f1` + assets verified 200 earlier the same hour. Post-rename quirk: project-claimed domains repin automatically on new prod deploys — `xplayercards-platform.vercel.app` resurfaced once and was removed again; durable removal = Vercel dashboard → Project → Settings → Domains (CLI cannot remove project domains).

**MacBook rename (verified):**
- Workspace folder renamed `Developer/XPlayerCards` → `Developer/WotaGame`; a compatibility symlink `Developer/XPlayerCards → WotaGame` keeps the OpenCode session, docs paths, and any external references working. Local servers verified fine post-rename.
- Launcher renamed `OPEN-STUDIO.command` → `WotaGame Control Center.command` (auto-starts 4178 + opens the dashboard; runs idempotent, verified).
- Docs absolute paths swept to `Developer/WotaGame`. Only build-time files `local-tools/.data/brand/hero.html`/`social.html` still carry old absolute `file://` paths (harmless).
- Remaining manual bits for the owner: the Chrome tab group is still named "XPC Control Center" (rename by right-clicking the tab group); there is no GitHub repo yet.
