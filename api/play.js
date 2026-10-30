import { getSql, publicBaseUrl } from "../lib/db.js";
import { renderGamePage } from "../lib/shared.js";

const STATIC_GAMES = new Map([
  ["hailstorm-run", {
    game: "hailstorm",
    title: "Hailstorm Run",
    tagline: "Keep moving. Dodge the hail. See how long you can survive the storm.",
    handle: "@WotaGame",
    accent: "#69b7ff"
  }],
  ["word-finder-puzzle-3be5f1", {
    game: "wordfinder",
    title: "Word Finder Puzzle",
    tagline: "A little brain break. Find the hidden words and challenge a friend.",
    handle: "@WotaGame",
    accent: "#a9f36c"
  }]
]);

export default async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  const slug = String(req.query?.slug || "");
  if (!/^[a-z0-9][a-z0-9-]{3,59}$/.test(slug)) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).send("Invalid game link.");
  }
  const base = publicBaseUrl(req);
  try {
    const sql = getSql();
    const rows = await sql`SELECT slug, config FROM public.games WHERE slug = ${slug} AND is_published = true LIMIT 1`;
    if (rows.length) {
      const html = renderGamePage({ slug: rows[0].slug, config: rows[0].config, baseUrl: base });
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    }
  } catch (error) {
    // If database is not configured or query fails, try static fallback below
  }

  if (STATIC_GAMES.has(slug)) {
    const html = renderGamePage({ slug, config: STATIC_GAMES.get(slug), baseUrl: base });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(404).send("<!doctype html><title>Game not found</title><main><h1>Game not found</h1><p>This mini-game may have been unpublished.</p></main>");
}
