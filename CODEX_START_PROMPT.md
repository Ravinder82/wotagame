# Initialisation Prompt — WotaGame Takeover

You are taking over the EXISTING WotaGame application in the currently opened Codex workspace. Do not scaffold a replacement, do not assume this handoff accurately describes every current file, and do not ask me to run commands manually if you can run them with your IDE terminal/tools.

## Mission for this first session
**Audit and orient first; do not start building features yet.** I want you to fully understand the actual project, write durable project memory, launch the available local pages, open the existing live Vercel site in a browser, and then report the true state plus the recommended next steps.

## Phase 1 — Inspect everything safely
1. Read `AGENTS.md`, `CODEX_HANDOFF.md`, and all docs under `docs/codex/`.
2. Inspect the real repository tree. Exclude bulky generated folders (for example `node_modules`, `.git`, `.vercel`, caches) from broad listings; inspect relevant files directly: `package.json`, all scripts, `index.html`, styles/scripts, `server.mjs`, `game-runtime.js`, `lib/`, `api/`, `schema.sql`, `vercel.json`, `.vercelignore`, both `local-tools` pages, launchers, examples and assets. Check for tests and read them.
3. Verify facts in this pack against source. Explicitly flag outdated details. Do not print or reveal environment/credential values. It is fine to report the presence of variable names (`DATABASE_URL`, `STUDIO_ADMIN_TOKEN`, `APP_URL`, `STUDIO_ORIGINS`) but never their values.
4. Inspect `.vercel/project.json` only for the project identity. Never dump `.vercel/.env.production.local` or `.env.local`.
5. Check whether `.git/` exists before discussing branches/remotes/history. Do not initialise Git, commit, push or change remotes.
6. Understand which routes are truly playable. Do not imply Picture Puzzle, Hailstorm Run or Crossword are finished unless source and actual runtime prove it.

## Phase 2 — Build persistent project memory
Create or update `docs/codex/PROJECT_MEMORY.md` with concise but useful evidence from the actual source:
- Product purpose and approved scope.
- Stack/runtime/dependency versions and exact start/check commands.
- File map and system boundaries.
- Local URL/port, routes and internal tools.
- Serverless routes and rewrite behavior.
- Neon data model and how the API accesses it (without secrets).
- Vercel project identity/domain/build/env-variable NAMES/alias caveats (no values).
- Games: which are implemented, partial, planned or Coming Soon.
- Game Studio behavior and limitations (Marketing was deleted 2026-10-31).
- Tests run and results; security/safety boundaries.
- Broken assets, console/network issues, technical debt, assumptions and next steps ranked by priority.
Use links/paths and be specific. Mark each uncertain item as “not verified”; do not invent.
Update any handoff notes only if needed to remove inaccuracies. Do not alter product source code in this orientation task.

## Phase 3 — Run checks and launch pages
1. First check whether port 4178 is already serving WotaGame. Do not kill unknown processes. Reuse a healthy server; if none is running, use the project's existing start script/launcher (`npm start` or `OPEN-STUDIO.command` as inspected) and keep it alive in the IDE environment.
2. Run non-destructive project checks, especially `npm run check` and relevant Node syntax checks. If dependencies are absent, install them only using this project's lockfile and package scripts; record what you did. Don't run migrations or database writes.
3. Open these local pages in the browser (using the available browser tool or macOS `open` from the IDE terminal if available):
   - `http://localhost:4178/`
   - `http://localhost:4178/studio`
4. Open these live pages in the browser:
   - `https://wotagame.vercel.app/`
   - `https://wotagame.vercel.app/g/word-finder-puzzle-3be5f1`
5. Inspect actual rendered pages when a browser is available. Check response status, console/network failures, broken image URLs, desktop and narrow mobile behavior. If browser viewing is unavailable, say that instead of pretending you visually inspected it. The live site is hosted externally; do not claim to “start” a Vercel server locally.
6. The supplied approved raster images are in `assets/wotagame-hero-assets.zip` as `xpc-hero.webp` (1800×749) and `xpc-social-preview.jpg` (1200×630). Check whether the public homepage actually references them. Do not extract/copy/replace images or modify the homepage during the orientation task; simply record the precise asset mismatch as a candidate next task.

## Phase 4 — Report back, do not deploy
Give me a concise report containing:
1. What the app is and how it is structured.
2. Which local/live pages you successfully opened (URLs/status) and whether the servers are running.
3. Test/check results and visual observations that were actually verified.
4. What is broken, unfinished or uncertain.
5. Your recommended next 3–5 steps in priority order. Put the raster hero integration and then independent game-thumbnail work in the right order based on evidence.
6. Exact paths for project memory/docs you created or changed.
7. One explicit line: “Production deployment: NOT performed.”

## Hard boundaries
- Do not deploy to Vercel in this task.
- Do not alter production Vercel environment variables, aliases, protection/security settings, database schema/data or published game records.
- Do not expose tokens, `DATABASE_URL`, `.env.local` or private `.vercel` environment files.
- Do not publish `local-tools/`.
- Do not delete application or data files, disable protection, kill unknown processes or run destructive commands. The owner's enclosing request authorizes removing only the temporary `Codex-Setup/` folder after all durable contents have been relocated or merged and duplicates have been verified.
- Do not change application code until you have completed the audit and reported the next steps.
- If a tool is blocked, use the safest available alternative and clearly say what was not completed. Don't keep me waiting or claim success without evidence.
