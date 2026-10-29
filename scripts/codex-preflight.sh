#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo "XPlayerCards Codex preflight — read-only"
echo "Project root: $PWD"
command -v node >/dev/null || { echo "ERROR: Node.js not found"; exit 1; }
node -e 'const major=Number(process.versions.node.split(".")[0]); console.log("Node:",process.version); if(major<20){console.error("Node >=20 required");process.exit(1)}'
for f in index.html game-runtime.js server.mjs package.json vercel.json schema.sql .vercelignore local-tools/studio.html local-tools/marketing.html; do
  [[ -f "$f" ]] && echo "OK: $f" || echo "MISSING: $f"
done
if [[ -f .vercel/project.json ]]; then node -e 'const p=require("./.vercel/project.json"); console.log("Vercel project:",p.projectName||"unknown","| ID:",p.projectId||"unknown","| org:",p.orgId||"unknown")'; else echo "WARNING: .vercel/project.json missing"; fi
if [[ -d .git ]]; then echo "Git metadata: present"; else echo "NOTE: no .git directory found"; fi
echo "Environment variable presence only; values never printed:"
for key in DATABASE_URL STUDIO_ADMIN_TOKEN APP_URL STUDIO_ORIGINS; do
  if [[ -f .env.local ]] && grep -qE "^${key}=" .env.local; then echo "  $key: present in .env.local"; else echo "  $key: not confirmed locally (may be configured only in Vercel)"; fi
done
[[ -f assets/arcade-hero.webp ]] && echo "Legacy hero path exists" || echo "KNOWN CANDIDATE: assets/arcade-hero.webp is absent"
if [[ -f assets/xplayercards-hero-assets.zip ]] && command -v unzip >/dev/null; then
  unzip -Z1 assets/xplayercards-hero-assets.zip | awk '$0 == "xpc-hero.webp" { found=1 } END { exit !found }' && echo "APPROVED HERO: present in assets/xplayercards-hero-assets.zip" || echo "WARNING: approved hero missing from asset bundle"
  unzip -Z1 assets/xplayercards-hero-assets.zip | awk '$0 == "xpc-social-preview.jpg" { found=1 } END { exit !found }' && echo "APPROVED SOCIAL IMAGE: present in assets/xplayercards-hero-assets.zip" || echo "WARNING: approved social image missing from asset bundle"
else
  echo "WARNING: approved image bundle or unzip command unavailable"
fi
grep -q '^local-tools/' .vercelignore 2>/dev/null && echo "OK: local-tools excluded from production" || echo "WARNING: verify .vercelignore"
[[ -d node_modules ]] && echo "node_modules present" || echo "node_modules missing; Codex should inspect lockfile and install if required"
echo "Read-only preflight complete. No deploy, database mutation or secret output was performed."
