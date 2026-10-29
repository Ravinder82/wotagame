import { getSql, publicBaseUrl } from "../lib/db.js";
import { isAdmin } from "../lib/auth.js";
import { normalizeConfig } from "../lib/shared.js";

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
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
}
export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  const slug = String(req.query?.slug || "");
  if (!/^[a-z0-9][a-z0-9-]{3,59}$/.test(slug)) return res.status(400).json({ error: "Invalid game slug." });
  try {
    const sql = getSql();
    if (req.method === "GET") {
      const rows = await sql`SELECT slug, config, created_at, updated_at FROM public.games WHERE slug = ${slug} AND is_published = true LIMIT 1`;
      if (!rows.length) return res.status(404).json({ error: "Game not found." });
      const base = publicBaseUrl(req);
      return res.status(200).json({
        ...rows[0], url: base + "/g/" + encodeURIComponent(slug),
        posterUrl: base + "/api/poster/" + encodeURIComponent(slug)
      });
    }
    if (req.method !== "PUT") {
      res.setHeader("Allow", "GET, PUT, OPTIONS");
      return res.status(405).json({ error: "Method not allowed." });
    }
    if (!isAdmin(req)) return res.status(401).json({ error: "Publishing token missing or invalid." });
    const body = req.body || {};
    const config = normalizeConfig(body.config || {});
    let poster = String(body.posterBase64 || "");
    poster = poster.replace(/^data:image\/png;base64,/i, "");
    if (!poster || poster.length > 1_800_000) return res.status(413).json({ error: "Poster is missing or too large." });
    const png = Buffer.from(poster, "base64");
    if (png.length < 24 || png.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") return res.status(400).json({ error: "Poster must be a valid PNG image." });
    const rows = await sql`
      UPDATE public.games
      SET config = ${JSON.stringify(config)}::jsonb,
          poster_base64 = ${png.toString("base64")},
          updated_at = now()
      WHERE slug = ${slug} AND is_published = true
      RETURNING slug, config, created_at, updated_at
    `;
    if (!rows.length) return res.status(404).json({ error: "Game not found." });
    const base = publicBaseUrl(req);
    return res.status(200).json({
      ...rows[0], url: base + "/g/" + encodeURIComponent(slug),
      posterUrl: base + "/api/poster/" + encodeURIComponent(slug)
    });
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    return res.status(status).json({ error: status === 500 ? "Could not access the game database." : error.message });
  }
}
