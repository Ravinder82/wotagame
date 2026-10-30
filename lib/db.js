import { neon } from "@neondatabase/serverless";

export function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    const error = new Error("Database is not configured yet. Set DATABASE_URL for the central game platform.");
    error.statusCode = 503;
    throw error;
  }
  return neon(connectionString);
}

export function publicBaseUrl(req) {
  const configured = String(process.env.APP_URL || "").trim().replace(/\/+$/, "");
  if (configured) return configured;
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  if (!/^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host)) throw new Error("Set APP_URL to your public HTTPS origin.");
  const protocol = process.env.VERCEL ? "https" : String(req.headers["x-forwarded-proto"] || "http");
  return protocol + "://" + host;
}