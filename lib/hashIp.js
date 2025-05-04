import crypto from 'crypto';

export function hashIp(ip) {
  return crypto.createHash("sha256").update(ip).digest("hex");
}