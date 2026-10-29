# Testing and Release Checklist

## Baseline syntax checks
```bash
npm install
npm run check
node --check api/game.js
node --check api/play.js
node --check api/poster.js
```
The package check script does not cover every root compatibility API handler, so check those explicitly.

## Local visual checks
- Start `npm start`, open `http://localhost:4178/`.
- Inspect desktop around 1440×900 and mobile around 390×844.
- Confirm the exact approved hero WebP loads; no broken requests and no SVG substitution.
- Check social metadata points at the new JPEG and returned MIME types are correct.
- Test mobile nav, search, cards, links, keyboard focus, reduced motion, console/network.
- Picture Puzzle, Hailstorm Run and Crossword remain Coming Soon. Word Finder remains on its stable route.

## API/security checks
- Unauthenticated `POST /api/games` should return 401.
- Existing Word Finder page returns 200 with canonical and OG/X metadata.
- Existing poster endpoint returns 200, `image/png`.
- Publish/update require the bearer token; never log it.
- Never delete or republish the existing Word Finder DB record just for smoke tests.
- The local Studio must not be public (Marketing was deleted 2026-10-31).

## Before a production release
- Get the owner's explicit approval.
- Run checks, inspect desktop/mobile and console/network.
- Ensure `.env.local`, `.vercel/` and all secrets are excluded from archives/commits.
- Ensure `.vercelignore` still excludes `local-tools/` and `vercel.json` still includes assets plus all three rewrites.

## After an approved deployment
- Homepage 200.
- `/assets/wotagame-hero.webp` 200 with `image/webp`.
- `/assets/wotagame-social.jpg` 200 with `image/jpeg`.
- Word Finder page 200.
- Word Finder poster 200 with `image/png`.
- Local-tools routes are not public.
- Check `vercel alias list` and visually inspect actual live rendering; HTTP 200 alone is insufficient.
- Report exact changed files, tests, visual results, remaining work and whether production was deployed.
