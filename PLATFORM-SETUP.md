# WotaGame — platform setup and operations

## Product architecture

The public site is a player-first arcade at https://wotagame.vercel.app/. The homepage is `index.html`; the local Creator Studio stays in `local-tools/` and are excluded from production by `.vercelignore`.

- `POST /api/games`: token-protected publish; stores normalized settings and a generated poster.
- `PUT /api/games/:slug`: token-protected update; keeps the stable game URL.
- `GET /api/games/:slug`: public game metadata.
- `GET /api/poster/:slug`: public PNG used for social previews.
- `/g/:slug`: standalone game page with server-rendered Open Graph and X metadata.

## Game status

- Word Finder — playable.
- Picture Puzzle — coming soon; gameplay page required.
- Hailstorm Run — coming soon; gameplay page required.
- Crossword — coming soon; gameplay page required.

## Local tools

Start the local server with `npm start` inside `~/Developer/WotaGame`.

- `WotaGame Control Center.command` opens the local dashboard at `http://localhost:4178/`.

The Marketing (Post Studio) system was deleted from the workspace on 2026-10-31; its archive lives at `local-tools/_archive/marketing-removed-2026-10-31.zip`.

The local server is static and does not run Vercel API functions. Publishing from the studio uses the configured production platform unless `vercel dev` is run with private local environment settings.

## Database

Use the dedicated Neon PostgreSQL project for WotaGame. `schema.sql` creates `public.games`; configs are JSONB and generated 1200×630 posters are stored as base64 text for this first version.

## Vercel environment variables

Production has the following variable names configured; never print their values:

- `DATABASE_URL`: Neon pooled connection string with SSL.
- `APP_URL`: `https://wotagame.vercel.app`.
- `STUDIO_ADMIN_TOKEN`: long random secret.
- `STUDIO_ORIGINS`: allowed browser origins including `http://localhost:4178,http://127.0.0.1:4178`.

When environment variables change, redeploy. The private token must not enter public HTML, shared game runtime, published config, Git or browser bundles.

## Deploy

```sh
cd ~/Developer/WotaGame
npm run check
vercel --prod --yes
```

## Production verification

- Open `https://wotagame.vercel.app/` and confirm the player-facing landing page loads with four curated cards.
- Verify Word Finder: `/g/word-finder-puzzle-3be5f1`.
- Verify its PNG poster: `/api/poster/word-finder-puzzle-3be5f1`.
- Check that `/local-tools/studio.html` returns 404 from production.
- Confirm anonymous publishing is rejected.
- Test the mobile homepage and game controls.
- X/Instagram previews vary by client and may be cached. Use normal website link previews, not an X Player Card intended for video playback.

## Security and limits

Publishing/update writes require the private admin token. The current setup is single-admin, not multi-user. Scores remain local to each browser; no global leaderboard is present. Posters are currently stored in Neon; object storage could be added if scale requires it.
