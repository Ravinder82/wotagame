import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { readdirSync } from "node:fs";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4178);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

// Workspace 2 — Public arcade preview + Game Studio only.
// Marketing system was deleted 2026-10-31. This 4178 workspace is Arcade preview + Game Studio only.
const localViews = new Map([
  ["/", "local-tools/control-center.html"],
  ["/__xpc/arcade", "index.html"],
  ["/__xpc/arcade/", "index.html"],
  ["/studio", "local-tools/studio.html"],
  ["/studio/", "local-tools/studio.html"]
]);

let publishState = {
  status: "idle",
  message: "Ready to publish the public arcade to Vercel.",
  url: "",
  startedAt: null,
  completedAt: null
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(JSON.stringify(body));
}

function getProductionUrl(output) {
  const urls = output.match(/https:\/\/[^\s]+/g) || [];
  const brand = url => /^https:\/\/wotagame(-[a-z0-9-]+)?\.vercel\.app/.test(url);
  return urls.find(brand) || urls.at(-1) || "https://wotagame.vercel.app/";
}

function countServerlessFunctions() {
  const files = [];
  const scan = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(full);
      else if (entry.name.endsWith(".js")) files.push(full);
    }
  };
  const apiDir = path.join(root, "api");
  if (fs.existsSync(apiDir)) scan(apiDir);
  return files.length;
}

function startPublish() {
  if (publishState.status === "publishing") return false;

  // Vercel Hobby plan caps deployments at 12 serverless functions.
  const fnCount = countServerlessFunctions();
  if (fnCount > 12) {
    publishState = {
      status: "failed",
      message: `Blocked before deploy: ${fnCount} serverless functions in api/ exceed Vercel's Hobby-plan limit of 12. Remove unused api/*.js files and publish again.`,
      url: "",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString()
    };
    return true; // state is set and shown by the UI on the next poll
  }

  publishState = {
    status: "publishing",
    message: `Publishing the public arcade to Vercel… (${fnCount} serverless functions, plan limit 12)`,
    url: "",
    startedAt: new Date().toISOString(),
    completedAt: null
  };

  const child = spawn(process.env.XPC_VERCEL_BIN || "vercel", ["--prod", "--yes"], {
    cwd: root,
    env: { ...process.env, CI: "1" },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let output = "";
  child.stdout.on("data", chunk => { output += String(chunk); });
  child.stderr.on("data", chunk => { output += String(chunk); });

  child.on("error", error => {
    publishState = {
      status: "failed",
      message: `Could not start Vercel publish: ${error.code === "ENOENT" ? "Vercel CLI is unavailable." : "see the local server terminal."}`,
      url: "",
      startedAt: publishState.startedAt,
      completedAt: new Date().toISOString()
    };
  });

  child.on("close", code => {
    const succeeded = code === 0;
    let failReason = "";
    if (!succeeded) {
      const lines = output.split("\n").map(l => l.trim()).filter(Boolean);
      const errLine = lines.findLast(l => /error|failed|too many|no more than|invalid|exceed/i.test(l));
      failReason = (errLine || lines.at(-1) || "").replace(/^>\s?/, "").slice(0, 280);
    }
    publishState = {
      status: succeeded ? "published" : "failed",
      message: succeeded
        ? "Public arcade published to Vercel."
        : `Vercel publish failed (exit code ${code}): ${failReason || "no output — run 'vercel --prod' in the project folder to see why."}`,
      url: succeeded ? getProductionUrl(output) : "",
      startedAt: publishState.startedAt,
      completedAt: new Date().toISOString()
    };
  });

  return true;
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);

    if (pathname === "/__xpc/publish/status") {
      if (req.method !== "GET") {
        sendJson(res, 405, { error: "Method not allowed." });
        return;
      }
      sendJson(res, 200, publishState);
      return;
    }

    if (pathname === "/__xpc/publish") {
      if (req.method !== "POST") {
        sendJson(res, 405, { error: "Method not allowed." });
        return;
      }
      if (req.headers.origin && ![`http://localhost:${port}`, `http://127.0.0.1:${port}`].includes(req.headers.origin)) {
        sendJson(res, 403, { error: "Local origin required." });
        return;
      }
      if (!startPublish()) {
        sendJson(res, 409, publishState);
        return;
      }
      sendJson(res, 202, publishState);
      return;
    }

    const rel = localViews.get(pathname) || pathname.replace(/^\/+/, "");
    const file = path.resolve(root, rel);
    if (!file.startsWith(root + path.sep) && file !== path.join(root, "index.html")) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const body = await readFile(file);
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
}).listen(port, "127.0.0.1", () => console.log(`WotaGame arcade + studio workspace running at http://localhost:${port}`));
