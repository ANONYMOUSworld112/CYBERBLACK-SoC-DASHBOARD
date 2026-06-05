import { getUserFromToken, publicUser } from '../auth.js';
import { db } from '../db.js';
import { logger } from '../utils/logger.js';

export function attachUser(req, _res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const user = getUserFromToken(token);
  if (user) req.user = publicUser(user);
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'UNAUTHENTICATED' });
  next();
}

export function requireTotp(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'UNAUTHENTICATED' });
  if (!req.user.totp_enabled) return res.status(403).json({ error: 'TOTP_NOT_ENROLLED' });
  next();
}

export function audit(userId, action, target, ip) {
  try {
    db.prepare('INSERT INTO audit_log (user_id, action, target, ip, ts) VALUES (?, ?, ?, ?, ?)')
      .run(userId || null, action, target || null, ip || null, Date.now());
  } catch (err) {
    logger.warn('audit log failed', { err: err.message });
  }
}
