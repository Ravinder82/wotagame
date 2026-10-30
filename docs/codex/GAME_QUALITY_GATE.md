# WotaGame — Two-Pass Quality Gate

Every game ships only after **two manual tests by the owner**: the base build, then a
full Round-2 upgrade pass. Nothing goes to `wotagame.vercel.app` before both pass.

## Pass 1 — Base game (Round 1)

Build the first playable version, then self-verify before the owner touches it.

- [ ] `node --check` on every touched JS file; no syntax errors
- [ ] Game registered: route in `server.mjs`, `vercel.json` route, `STATIC_GAMES` in `api/play.js`, card art in `assets/`
- [ ] `lib/shared.js` `GAME_TYPES` / `normalizeConfig` accepts the new game type
- [ ] Runs at `http://localhost:4178/g/<slug>` with no console errors
- [ ] Core loop completable: start → play → fail/finish → result → play again
- [ ] Personal best persists in `localStorage` (`xmg.best.<game>`)
- [ ] Share / challenge link produces a working URL
- [ ] Touch controls have ≥44px targets and `aria-label`s
- [ ] `lib/game-runtime.js` and `game-runtime.js` are byte-identical (`node scripts/build-runtime.mjs`)

**Owner test 1:** owner plays the base build, reports bugs and fun issues.

## Pass 2 — Refinement (Round 2)

Run this whole checklist again on top of the base build. This is the
"complete upgrade prompt" — apply it to *every* game after v1 exists.

### Feel & mechanics
- [ ] Fixed-timestep physics (1/60 accumulator) — no frame-rate-dependent movement
- [ ] Coyote time + jump buffering + variable jump height
- [ ] Acceleration/skid instead of instant velocity flips
- [ ] Hit-stop, screen shake (respect `prefers-reduced-motion`), squash & stretch
- [ ] Fair spawning: telegraphs, guaranteed survivable gaps, difficulty tiers with banners
- [ ] A scoring hook beyond survival (combo / near-miss / multipliers)
- [ ] Pause (button + `Esc`/`P`) and auto-pause on `visibilitychange`
- [ ] Death/fail states explain *why* and how to do better

### Art & world
- [ ] Player is a real character: animated limbs (IK or cycle), cloth/trail, rim light
- [ ] ≥5 parallax layers, offscreen-cached where possible
- [ ] Atmospheric depth: sky gradient, moon/light source, clouds, fog, vignette, colour grade
- [ ] Particle variety per event (impact, land, pickup, destruction)
- [ ] Foreground bokeh / weather passing the camera

### Audio — music, not clicks
- [ ] Looping **musical** bed (chord progression + bass + arp + drums), scheduled with Web Audio lookahead
- [ ] Intensity layers that track game difficulty
- [ ] SFX are musical/contextual (filtered noise + chord tones), not raw beeps
- [ ] Mute toggle in-canvas, persisted to `localStorage`
- [ ] Audio only starts after a user gesture; never throws when `AudioContext` is blocked

### Dynamic UI — every screen
Must be verified at each of these viewports with **no horizontal scroll** and **page height ≤ viewport**:

| Target | Size |
|---|---|
| Phone portrait | 390 × 844 |
| Phone landscape | 844 × 390 |
| Small landscape | 667 × 375 |
| Tablet portrait | 768 × 1024 |
| Tablet landscape | 1024 × 768 |
| Laptop | 1200 × 800 |
| Laptop | 1440 × 900 |
| Desktop | 1920 × 1080 |

- [ ] Canvas backing store = CSS size × `devicePixelRatio` (capped at 2)
- [ ] World size derived from real aspect ratio, so gameplay never distorts
- [ ] ≥44px primary touch targets at every breakpoint
- [ ] Desktop ≥900px uses the info-panel + game-stage grid (`lib/shared.js`)

### Controls inside the play canvas
- [ ] Primary controls are drawn/overlaid *inside* the stage, not below it
- [ ] Multi-touch via pointer events with `setPointerCapture`
- [ ] Gesture fallback: tap = jump, swipe down = slide, drag = move
- [ ] Keyboard still fully playable; canvas has `role="application"` + label
- [ ] Pause and mute live in-canvas too

### Evidence
- [ ] Browser console clean over ≥10s of automated input
- [ ] Screenshot of the running game and of the result screen
- [ ] `docs/codex/PROJECT_MEMORY.md` updated with what changed and the evidence

**Owner test 2:** owner plays the refined build.

## Release

Only after owner test 1 **and** owner test 2 pass:

1. Prepare approval packet: what changed, local test link, diff summary, risks, rollback
2. **Owner approves**
3. Push → deploy → confirm `https://wotagame.vercel.app/g/<slug>`

Owner approval is required before pushing, PRs, merging, deploying, production DB
writes, Vercel settings changes, public posts, spending, or privacy/security changes.