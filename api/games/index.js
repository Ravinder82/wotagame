import { randomBytes } from "node:crypto";
import { getSql, publicBaseUrl } from "../../lib/db.js";
import { isAdmin } from "../../lib/auth.js";
import { normalizeConfig, slugify } from "../../lib/shared.js";

function cors(req, res) {
  const origin = String(req.headers.origin || "");
  const allowed = new Set([
    "http://localhost:4178", "http://127.0.0.1:4178",
    ...(process.env.STUDIO_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean),
    String(process.env.APP_URL || "").replace(/\/+$/, "")
  ]);
  if (origin && allowed.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}
function fail(res, status, message) {
  return res.status(status).json({ error: message });
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  try {
    if (req.method === "GET") {
      if (!isAdmin(req)) return fail(res, 401, "Publishing token missing or invalid.");
      const sql = getSql();
      const rows = await sql`SELECT slug, config, created_at, updated_at FROM public.games WHERE is_published = true ORDER BY updated_at DESC LIMIT 50`;
      const base = publicBaseUrl(req);
      return res.status(200).json({
        games: rows.map(row => ({
          ...row, url: base + "/g/" + encodeURIComponent(row.slug),
          posterUrl: base + "/api/poster/" + encodeURIComponent(row.slug)
        }))
      });
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST, OPTIONS");
      return fail(res, 405, "Method not allowed.");
    }
    if (!isAdmin(req)) return fail(res, 401, "Publishing token missing or invalid.");
    const body = req.body || {};
    const config = normalizeConfig(body.config || {});
    let poster = String(body.posterBase64 || "");
    poster = poster.replace(/^data:image\/png;base64,/i, "");
    if (!poster || poster.length > 1_800_000) return fail(res, 413, "Poster is missing or too large. Use a 1200×630 PNG under about 1.3 MB.");
    const png = Buffer.from(poster, "base64");
    if (png.length < 24 || png.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
      return fail(res, 400, "Poster must be a valid PNG image.");
    }
    const slug = slugify(config.title) + "-" + randomBytes(3).toString("hex");
    const sql = getSql();
    await sql`
      INSERT INTO public.games (slug, config, poster_base64, is_published)
      VALUES (${slug}, ${JSON.stringify(config)}::jsonb, ${png.toString("base64")}, true)
    `;
    const base = publicBaseUrl(req);
    return res.status(201).json({
      slug, config,
      url: base + "/g/" + encodeURIComponent(slug),
      posterUrl: base + "/api/poster/" + encodeURIComponent(slug),
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    return fail(res, status, status === 500
      ? "Could not publish game. Check the database configuration and platform logs."
      : error.message || "Request failed.");
  }
}