# Known State and Next Work

This began as a historical handoff snapshot from October 2026. Current verified findings are in [`PROJECT_MEMORY.md`](PROJECT_MEMORY.md); recheck source and live behavior before treating old hosting details as current.

## Project and hosting
- Mac project: `~/Developer/WotaGame`.
- Public homepage: https://wotagame.vercel.app/
- Existing published Word Finder URL: https://wotagame.vercel.app/g/word-finder-puzzle-3be5f1
- Local server historically runs on port 4178; start command is normally `npm start`, but inspect `package.json` first.
- Local Creator Studio: `http://localhost:4178/studio`. Marketing was deleted 2026-10-31 (archive: `local-tools/_archive/marketing-removed-2026-10-31.zip`).
- Vercel project: `wotagame`; project ID `prj_dB44QYXaKqFbwf1M67daFlin7Xr0`; org/team ID `team_jw1VrzB3HC36tmTRZd7DQUh8`.
- Neon project: `wotagame-platform`; project ID `steep-butterfly-21298884`; DB `wotagame`; branch `br-misty-math-b74jfbpe`; app role `wotagame_app`; table `public.games`.
- Variable names recorded in Production: `DATABASE_URL`, `STUDIO_ADMIN_TOKEN`, `APP_URL`, `STUDIO_ORIGINS`. Never print values.

## Approved art packaged with the project
- `assets/wotagame-hero.webp` (1800×749) and `assets/wotagame-social.jpg` (1200×630) are the current brand assets; the source ZIP stays for provenance.
- `assets/favicon.png` is the lime ✳ site icon.

## Verified source/live differences
- Working-tree `index.html` references `/assets/wotagame-hero.webp`; deploy status is tracked in PROJECT_MEMORY.
- Working-tree Open Graph/X metadata use `/assets/wotagame-social.jpg`; deploy status is tracked in PROJECT_MEMORY.
- Production currently loads `/assets/arcade-hero.svg`, an older controller-and-dog illustration. The approved raster hero is not live.
- `server.mjs` now includes WebP/JPEG/PNG MIME mappings; the local server was restarted after the change.
- The working-tree homepage no longer throws at inline line 231: the obsolete listener for missing `#viewAll` was removed, and local search interaction was verified. Production still has the old handler until an approved deployment, so its mobile navigation remains stale.

## Recommended next work
1. With owner approval, deploy the homepage handler fix and verify production search, mobile navigation, share link, and year setup.
2. Inspect the integrated raster assets at desktop/mobile sizes.
3. Create and approve distinct raster thumbnails per game, one at a time. Never reuse one generic hero crop for all cards.
4. Add browser smoke coverage; current automated checks cover syntax only.
5. Reconcile the live deployment only after owner approval, then run the full release checklist.

## Guardrails
Do not deploy, edit production settings/aliases, mutate Neon, delete the published Word Finder row, publish local tools, reveal credentials or change application code during an orientation task. The owner separately authorized removing only the temporary `Codex-Setup/` staging folder after its durable contents have been relocated or merged and duplicates verified.
