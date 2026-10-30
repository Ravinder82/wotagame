import { getSql } from "../lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end();
  }
  const slug = String(req.query?.slug || "");
  if (!/^[a-z0-9][a-z0-9-]{3,59}$/.test(slug)) return res.status(400).end();
  try {
    const sql = getSql();
    const rows = await sql`SELECT poster_base64 FROM public.games WHERE slug = ${slug} AND is_published = true LIMIT 1`;
    if (!rows.length) return res.status(404).end();
    const image = Buffer.from(rows[0].poster_base64, "base64");
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", String(image.length));
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
    res.setHeader("X-Content-Type-Options", "nosniff");
    return req.method === "HEAD" ? res.status(200).end() : res.status(200).send(image);
  } catch {
    return res.status(500).end();
  }
}