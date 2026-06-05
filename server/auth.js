import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { db } from './db.js';

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role, totp: !!user.totp_enabled },
    config.jwtSecret,
    { expiresIn: config.jwtTtl },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function getUserFromToken(token) {
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return db.prepare('SELECT id, username, email, role, totp_enabled, totp_secret FROM users WHERE id = ?').get(payload.sub);
  } catch {
    return null;
  }
}

export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    totp_enabled: !!u.totp_enabled,
  };
}
