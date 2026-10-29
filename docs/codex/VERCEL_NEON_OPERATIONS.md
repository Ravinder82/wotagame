# Vercel and Neon Operations — no secrets

## Vercel

The identifiers and alias/security notes below are historical handoff records unless explicitly verified in [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md). Do not treat them as current account state.
- Project: `wotagame`
- Project ID: `prj_dB44QYXaKqFbwf1M67daFlin7Xr0`
- Team/org ID: `team_jw1VrzB3HC36tmTRZd7DQUh8`
- Official production URL: https://wotagame.vercel.app/
- A prior alias inspection recorded the official domain pointing to `wotagame-4zm0u2hdc-ravinder82s-projects.vercel.app`; the current alias target was not verified in the 2026-10-22 audit.
- Prior notes say the old `wotagame.vercel.app` alias was removed and deployment protection/SSO was disabled. Current alias and protection state were not verified. Do not alter aliases or security settings without owner approval.

## Production environment variable names (values intentionally omitted)
- `DATABASE_URL`: Neon pooled PostgreSQL connection string with SSL (**secret**).
- `STUDIO_ADMIN_TOKEN`: bearer token for publish/update (**secret**).
- `APP_URL`: should be `https://wotagame.vercel.app`.
- `STUDIO_ORIGINS`: allowed API browser origins; localhost Studio origins have been configured.
Never print values, put them in Markdown, commit them or paste them to Codex. A key-name-only check on 2026-10-22 found none of the four names in `.env.local`; Vercel environment configuration was not verified. Keep `.env.local` and private `.vercel` files unread and private.

## Neon identity

The following account identifiers came from prior handoff notes and were not verified against Neon during the 2026-10-22 audit.
- Project name: `wotagame-platform`
- Project ID: `steep-butterfly-21298884`
- Database: `wotagame`
- Branch ID: `br-misty-math-b74jfbpe`
- App role: `wotagame_app`
- Table: `public.games`
- Schema source: `schema.sql`

## Local development
```bash
npm install
npm run check
npm start
```
Homepage: `http://localhost:4178/`. Studio at `/studio` (4178). Marketing was deleted 2026-10-31. `server.mjs` serves static files only; it does not implement Vercel serverless APIs.

## Deployment — only with the owner's explicit approval
```bash
npm run check
node --check api/game.js
node --check api/play.js
node --check api/poster.js
vercel --prod --yes
vercel alias list
```
After an approved deploy, verify the homepage, actual rendered hero image, WebP and JPEG content-types, Word Finder route and PNG poster, local-tools 404s and current official alias. HTTP 200 by itself is not proof that a correct image is being shown.
