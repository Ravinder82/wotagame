import { renderGamePage } from "./lib/shared.js";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { networkInterfaces } from "node:os";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4178);
const bindHost = process.env.XPC_HOST || "0.0.0.0";
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm"
};

// Workspace -- Public arcade preview + Game Studio only.
const localViews = new Map([
  ["/", "index.html"],
  ["/__xpc/arcade", "index.html"],
  ["/__xpc/arcade/", "index.html"],
  ["/studio", "local-tools/studio.html"],
  ["/studio/", "local-tools/studio.html"]
]);

function isLoopbackAddress(address = "") {
  return address === "127.0.0.1" || address === "::1" || address.startsWith("::ffff:127.");
}

function isPhonePreviewRequest(method, pathname) {
  return ["GET", "HEAD"].includes(method)
    && (["/__xpc/arcade", "/__xpc/arcade/", "/index.html", "/studio", "/studio/"].includes(pathname)
      || pathname.startsWith("/assets/")
      || pathname.startsWith("/g/")
      || /^\/__xpc\/local-game\/[a-z0-9-]+\/(?:cover|play)(?:\/.*)?$/.test(pathname));
}

function getLanAddress() {
  const interfaces = networkInterfaces();
  for (const name of ["en0", "en1", ...Object.keys(interfaces)]) {
    const addresses = interfaces[name];
    for (const address of addresses || []) {
      if (!address.internal && (address.family === "IPv4" || address.family === 4)) return address.address;
    }
  }
  return "<Mac-LAN-IP>";
}

const studioRoot = path.join(root, "local-tools", "ohmygame");
const examplesRoot = path.join(studioRoot, ".runtime", "examples");
let localExamples = [];
try {
  const catalog = JSON.parse(await readFile(path.join(examplesRoot, "catalog.json"), "utf8"));
  if (Array.isArray(catalog.examples)) {
    localExamples = catalog.examples.filter(example =>
      example && /^[a-z0-9-]+$/.test(example.id)
      && example.type === "web-game"
      && typeof example.name === "string"
      && typeof example.description === "string"
      && typeof example.cover === "string"
      && typeof example.play === "string"
    );
  }
} catch {}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => {
    switch (character) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return character;
    }
  });
}

function addLocalExampleCards(html) {
  if (!localExamples.length) return html;
  const cards = localExamples.map(example => {
    const name = escapeHtml(example.name);
    const description = escapeHtml(example.description);
    const search = escapeHtml(`${example.name} ${example.description} OhMyGame local sample`);
    const gameUrl = `/__xpc/local-game/${example.id}/play/`;
    const coverUrl = `/__xpc/local-game/${example.id}/cover`;
    return `<article class="game-card" data-search="${search}"><div class="card-art"><img class="card-art-image" src="${coverUrl}" alt="${name} game cover"></div><div class="card-body"><div class="card-title-row"><h3 class="card-title">${name}</h3><span class="card-arrow" aria-hidden="true">\u2197</span></div><p class="card-desc">${description}</p><a class="button card-action" href="${gameUrl}">Play Local Sample <span aria-hidden="true">\u2192</span></a></div></article>`;
  }).join("\n");
  const marker = '  <div class="empty-state" id="emptyState">';
  const localSection = `<div class="section-head" style="margin-top:38px"><div><div class="eyebrow" style="margin-bottom:10px"><span class="spark">\u2747</span> Made with OhMyGame</div><h2>Studio Sample Games</h2><p>Playable examples available in this local preview.</p></div></div><div class="games-grid" id="ohmygameSamples">${cards}</div>\n`;
  return html.replace(marker, `${localSection}${marker}`);
}

function getLocalExampleFile(pathname) {
  const match = pathname.match(/^\/__xpc\/local-game\/([a-z0-9-]+)\/(cover|play)(?:\/(.*))?$/);
  if (!match) return null;
  const [, id, resource, requestedPath = ""] = match;
  const example = localExamples.find(entry => entry.id === id);
  if (!example || (resource === "cover" && requestedPath)) return null;
  const file = resource === "cover"
    ? path.resolve(examplesRoot, example.cover)
    : path.resolve(examplesRoot, example.play, requestedPath || "index.html");
  return file.startsWith(`${examplesRoot}${path.sep}`) ? file : null;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);

    if (!isLoopbackAddress(req.socket.remoteAddress) && !isPhonePreviewRequest(req.method, pathname)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" });
      res.end("Only the public arcade preview is available over the local network.");
      return;
    }

    if (pathname.startsWith("/g/")) {
      const slug = pathname.replace(/^\/g\//, "").replace(/\/+$/, "");
      if (!/^[a-z0-9][a-z0-9-]{3,59}$/.test(slug)) {
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Invalid game link.");
        return;
      }
      const staticConfigs = {
        "hailstorm-run": {
          game: "hailstorm",
          title: "Hailstorm Run",
          tagline: "Keep moving. Dodge the hail. See how long you can survive the storm.",
          handle: "@WotaGame",
          accent: "#69b7ff"
        },
        "word-finder-puzzle-3be5f1": {
          game: "wordfinder",
          title: "Word Finder Puzzle",
          tagline: "A little brain break. Find the hidden words and challenge a friend.",
          handle: "@WotaGame",
          accent: "#a9f36c"
        }
      };
      const cfg = staticConfigs[slug] || {
        game: slug === "hailstorm-run" ? "hailstorm" : "wordfinder",
        title: slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        tagline: "Mini-game challenge on WotaGame.",
        handle: "@WotaGame",
        accent: "#69b7ff"
      };
      const baseUrl = `http://${req.headers.host || "localhost:4178"}`;
      const html = renderGamePage({ slug, config: cfg, baseUrl });
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      });
      res.end(html);
      return;
    }

    if (pathname.startsWith("/__xpc/local-game/")) {
      const file = getLocalExampleFile(pathname);
      if (!file) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Local game not found.");
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      });
      res.end(body);
      return;
    }

    const rel = localViews.get(pathname) || pathname.replace(/^\/+/, "");
    const file = path.resolve(root, rel);
    if (!file.startsWith(root + path.sep) && file !== path.join(root, "index.html")) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    let body = await readFile(file);
    if (pathname === "/__xpc/arcade" || pathname === "/__xpc/arcade/") body = addLocalExampleCards(body.toString("utf8"));
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, bindHost, () => {
  console.log(`WotaGame arcade + Game Studio running at http://localhost:${port}`);
  console.log(`iPhone arcade preview (same Wi-Fi): http://${getLanAddress()}:${port}/__xpc/arcade`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
