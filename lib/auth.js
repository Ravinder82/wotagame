import { timingSafeEqual } from "node:crypto";

export function isAdmin(req) {
  const expected = String(process.env.STUDIO_ADMIN_TOKEN || "");
  const header = String(req.headers.authorization || "");
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!expected || expected.length < 32 || !match) return false;
  const received = match[1];
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}