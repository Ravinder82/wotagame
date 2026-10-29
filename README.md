# WotaGame — Player-first arcade

WotaGame is a curated browser-game arcade. The public Vercel homepage is the player-facing game catalog; the creator studio stays a local/internal tool.

## Public site

- Production: https://wotagame.vercel.app/
- Word Finder: https://wotagame.vercel.app/g/word-finder-puzzle-3be5f1
- The Vercel project serves all published games with stable `/g/<slug>` URLs.
- Game pages use server-rendered Open Graph and X `summary_large_image` metadata.

## Four-game launch lineup

- **Word Finder** — playable now.
- **Picture Puzzle** — in development.
- **Hailstorm Run** — in development.
- **Crossword** — in development.

The homepage marks unfinished games as “Coming Soon” rather than linking to broken routes.

## Local tools

### Creator Studio
Double-click `OPEN-STUDIO.command` or run:

```sh
cd ~/Developer/WotaGame
npm start
```

Then visit `http://localhost:4178/studio`. The studio can preview games, edit post copy, publish through the central API with the private admin token, and export standalone game ZIP files.

Both local tools are inside `local-tools/` and excluded from Vercel deployments via `.vercelignore`. They are intentionally not part of the public player-facing website.

## Project structure

- `index.html` — public arcade landing page.
- `assets/` — original SVG hero/game artwork and the 1200×630 homepage social-preview PNG used by X/Open Graph.
- `game-runtime.js` — shared runtime used by existing hosted mini-games.
- `local-tools/studio.html` — local/internal game authoring studio.
The Marketing/Post Studio system was deleted from the workspace on 2026-10-31 (archive: `local-tools/_archive/marketing-removed-2026-10-31.zip`).
- `server.mjs` — local static development server.
- `api/` — Vercel serverless handlers for publishing, retrieving games and serving pages/posters.
- `lib/` — shared configuration, database/auth helpers and HTML game-page rendering.
- `schema.sql` — Neon PostgreSQL schema.
- `vercel.json` — Vercel function/build/route configuration.
- `.vercelignore` — keeps local tools out of public deployment.

## Development and deployment

```sh
cd ~/Developer/WotaGame
npm run check
vercel --prod --yes
```

After deploying, verify the homepage, Word Finder game page and poster endpoint. Use the private admin token only in the server environment and the local studio's transient publishing field; never place it in public HTML or commit it.

## Data and current limits

Neon PostgreSQL stores published game configs and generated social posters. Personal bests/scores remain local to each player's browser; there is no global leaderboard or account system. Publishing uses a single admin token and is not yet a multi-user creator SaaS.
