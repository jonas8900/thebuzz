import crypto from "crypto";

/**
 * Normalizes IPv6 loopback and IPv4-mapped IPv6 addresses to standard IPv4 format.
 */
export function normalizeIp(ip = "") {
  if (!ip) return "unknown";
  const cleaned = String(ip).trim();
  if (cleaned === "::1") return "127.0.0.1";
  if (cleaned.startsWith("::ffff:")) return cleaned.slice(7);
  return cleaned;
}

/**
 * Checks whether a string is already a valid 64-character SHA-256 hex digest.
 */
export function isHashed(ip = "") {
  return /^[a-f0-9]{64}$/i.test(String(ip));
}

/**
 * Returns a SHA-256 hex hash of the normalized IP address.
 */
export function hashIp(ip = "") {
  const normalized = normalizeIp(ip);
  if (isHashed(normalized)) return normalized.toLowerCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Extracts the client IP from an incoming HTTP request (supports reverse proxies like Coolify/Traefik and Heroku).
 */
export function getClientIpFromReq(req) {
  const xff = req?.headers?.["x-forwarded-for"];
  const rawIp = Array.isArray(xff)
    ? xff[0]
    : xff?.split(",")[0]?.trim() || req?.socket?.remoteAddress || "unknown";
  return normalizeIp(rawIp);
}

/**
 * Extracts the client IP from a Socket.IO handshake.
 */
export function getClientIpFromSocket(socket) {
  const xff = socket?.handshake?.headers?.["x-forwarded-for"];
  const rawIp = Array.isArray(xff)
    ? xff[0]
    : xff?.split(",")[0]?.trim() || socket?.handshake?.address || "unknown";
  return normalizeIp(rawIp);
}
