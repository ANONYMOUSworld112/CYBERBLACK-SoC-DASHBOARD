import crypto from 'node:crypto';

export function randomId(bytes = 16) {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}
