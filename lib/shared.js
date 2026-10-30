import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const GAME_TYPES = new Set(["reaction", "higher", "memory", "wordfinder", "hailstorm"]);

export function normalizeConfig(input = {}) {
  const game = String(input.game || "reaction");
  if (!GAME_TYPES.has(game)) throw new Error("Unknown game type.");
  const title = String(input.title || "").trim().slice(0, 80);
  const tagline = String(input.tagline || "").trim().slice(0, 180);
  const handle = String(input.handle || "@creator").trim().slice(0, 40);
  const accent = String(input.accent || "#a9f36c").trim();
  const postText = String(input.postText || "").trim().slice(0, 1200);
  if (!title) throw new Error("Add a game title before publishing.");
  if (!/^#[0-9a-f]{6}$/i.test(accent)) throw new Error("Accent must be a six-digit hex color.");
  return {
    game, handle, title, tagline, accent,
    postText,
    siteUrl: String(input.siteUrl || "").trim().slice(0, 300)
  };
}

export function slugify(value) {
  return String(value || "mini-game")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36) || "mini-game";
}

export function safeJson(value) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

const runtimePath = fileURLToPath(new URL("./game-runtime.js", import.meta.url));

export function renderGamePage({ slug, config, baseUrl }) {
  const publicUrl = baseUrl.replace(/\/+$/, "") + "/g/" + encodeURIComponent(slug);
  const posterUrl = baseUrl.replace(/\/+$/, "") + "/api/poster/" + encodeURIComponent(slug);
  const title = escapeHtml(config.title);
  const description = escapeHtml(config.tagline);
  const accent = escapeHtml(config.accent);
  const handle = escapeHtml(config.handle);
  const runtime = readFileSync(runtimePath, "utf8").replace(
    "const CFG=__CONFIG__;",
    "const CFG=" + safeJson({ ...config, siteUrl: publicUrl, publishedSlug: slug }) + ";"
  );
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="${accent}">
<title>${title} — Mini-game challenge</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${escapeHtml(publicUrl)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${escapeHtml(posterUrl)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${escapeHtml(publicUrl)}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${escapeHtml(posterUrl)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<style>
*{box-sizing:border-box}:root{color-scheme:dark;--accent:${accent}}
body{margin:0;min-height:100vh;padding:18px;background:radial-gradient(ellipse at 30% -10%,#26372d,transparent 48%),#0d1013;color:#f6f7fb;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;align-items:flex-start;justify-content:center}
.shell{width:100%;max-width:540px;padding:clamp(16px,4vw,24px);border:1px solid #303741;border-radius:22px;background:linear-gradient(155deg,#1a1f22,#111418 70%);box-shadow:0 20px 55px #0006}
.topline{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:19px}.kicker{color:var(--accent);font-size:10px;font-weight:850;letter-spacing:.17em}.byline{color:#959eac;font-size:11px;margin-top:4px}.tag{font-size:10px;border:1px solid #ffffff22;border-radius:99px;padding:5px 8px;color:#cbd4de}
h1{font-size:clamp(27px,7vw,38px);line-height:1.03;letter-spacing:-.06em;margin:0 0 8px;font-weight:900}.desc{font-size:13px;color:#aab4c1;margin:0 0 18px}
.panel{min-width:0}.area{border:1px solid #303741;border-radius:15px;padding:13px;background:#0b0e11;min-height:180px;display:flex;flex-direction:column;justify-content:center}.area>*{width:100%;max-width:840px;margin-left:auto;margin-right:auto}.muted{font-size:11px;color:#9ba5b3}.number{font-size:57px;font-weight:900;letter-spacing:-.07em;line-height:1.1;margin:6px 0 14px}.row{display:flex;gap:9px;align-items:center}.row>*{flex:1}.btn{border:0;border-radius:11px;background:var(--accent);color:#10150c;font-weight:850;padding:12px 13px;min-height:43px}.btn.secondary{background:#272d35;color:#f4f6f9;border:1px solid #3e4652}.arena{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;text-align:center;min-height:150px}.arena button{width:100%;min-height:88px;font-size:17px}.arena button.wait{background:#ff7c7c;color:#351010}.arena button.go{background:var(--accent);color:#111a0a}.feedback{min-height:21px;margin:8px 0;color:#bbc4d0;text-align:center;font-size:12px}
.result{display:none;border:1px solid #465b39;background:#172117;border-radius:13px;padding:14px;margin-top:13px}.result h2{margin:0 0 6px;font-size:19px}.result p{color:#b6c1b0;font-size:12px;margin:0 0 12px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.tile{aspect-ratio:1;border-radius:10px;border:1px solid #3b4450;background:#1a2229;color:white;font-size:clamp(20px,6vw,30px);font-weight:800}.tile.open,.tile.matched{background:#222d1e;border-color:var(--accent)}.tile.matched{opacity:.55}.sharetext{overflow-wrap:anywhere}.foot{font-size:10px;color:#748090;text-align:center;margin:16px 0 0}.challenge{font-size:11px;color:#f4d38a;border:1px solid #66552b;background:#241f13;border-radius:9px;padding:8px 10px;margin-bottom:12px}
@media(max-width:360px){.shell{padding:14px}.grid{gap:5px}}
@media(max-width:560px){body{padding:10px}.shell{padding:13px;border-radius:18px}.area{padding:9px;border-radius:13px}}
@media(min-width:430px){h1{font-size:clamp(30px,6.2vw,42px)}.desc{font-size:14px}}
@media(min-width:600px) and (max-width:899px){.shell{max-width:820px}.area{padding:15px}h1{font-size:clamp(32px,5vw,44px)}}
@media(orientation:landscape) and (max-height:600px){
 body{padding:8px;align-items:flex-start}
 .shell{max-width:none;padding:12px 16px;display:grid;grid-template-columns:minmax(190px,250px) minmax(0,1fr);column-gap:16px;align-items:start}
 .panel{min-width:0;padding-right:12px;border-right:1px solid #262d36}
 .panel .feedback{text-align:left}
 .panel .foot{margin-top:14px;padding-top:0}
 .topline{margin-bottom:6px}
 h1{font-size:clamp(17px,5vh,23px);margin-bottom:3px}
 .desc{font-size:11.5px;margin-bottom:8px}
 .feedback{font-size:11px;margin:0 0 6px}
 .foot{font-size:9.5px}
 .area{grid-column:2;min-height:0;padding:8px}
}
@media(min-width:900px) and (min-height:500px){
 body{padding:clamp(20px,3vw,40px);align-items:center;
  background:radial-gradient(ellipse at 22% -10%,#26372d,transparent 46%),radial-gradient(ellipse at 92% 108%,#1b2a3d,transparent 52%),#0d1013}
 .shell{max-width:1500px;display:grid;grid-template-columns:minmax(280px,380px) minmax(0,1fr);column-gap:clamp(22px,3vw,46px)}
 .panel{display:flex;flex-direction:column;padding-right:clamp(0px,1.2vw,16px);border-right:1px solid #262d36}
 .panel .feedback{text-align:left}
 .panel .foot{margin-top:auto;padding-top:18px}
 .area{grid-column:2;padding:clamp(16px,1.6vw,24px)}
 h1{font-size:clamp(34px,3vw,46px)}.desc{font-size:14.5px}
}
</style></head><body><main class="shell">
<div class="panel">
<div class="topline"><div><div class="kicker">✳ MINI-GAME CHALLENGE</div><div class="byline">${handle} · share your result</div></div><span class="tag" id="bestTag">LOCAL BEST</span></div>
<h1>${title}</h1><p class="desc">${description}</p>
<div id="challenge" class="challenge" hidden></div>
<p class="feedback" id="feedback" aria-live="polite"></p>
<div class="result" id="result" aria-live="polite"><h2 id="resultTitle">Challenge complete</h2><p id="resultDetail"></p><div class="row"><button class="btn" id="share">Share score ↗</button><button class="btn secondary" id="again">Play again</button></div><p class="muted sharetext" id="shareHint" style="margin-top:10px"></p></div>
<p class="foot">Free to play · Personal best stored on this device · No account</p>
</div>
<div class="area" id="area"></div>
</main><script>${runtime}</script></body></html>`;
}
