import { getSql, publicBaseUrl } from "../lib/db.js";
import { renderGamePage } from "../lib/shared.js";

export default async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
  const slug = String(req.query?.slug || "");
  if (!/^[a-z0-9][a-z0-9-]{3,59}$/.test(slug)) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(400).send("Invalid game link.");
  }
  try {
    const sql = getSql();
    const rows = await sql`SELECT slug, config FROM public.games WHERE slug = ${slug} AND is_published = true LIMIT 1`;
    if (!rows.length) {
      res.setHeader("Cache-Control", "no-store");
      return res.status(404).send("<!doctype html><title>Game not found</title><main><h1>Game not found</h1><p>This mini-game may have been unpublished.</p></main>");
    }
    const base = publicBaseUrl(req);
    const html = renderGamePage({ slug: rows[0].slug, config: rows[0].config, baseUrl: base });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  } catch (error) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(Number(error?.statusCode) || 500).send("The game could not load. Check the platform's database configuration.");
  }
}
