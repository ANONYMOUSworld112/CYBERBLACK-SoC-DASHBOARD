import { Router } from 'express';
import bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { db } from '../db.js';
import { signAccessToken, publicUser } from '../auth.js';
import { requireAuth, audit } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { logger } from '../utils/logger.js';
import { config } from '../config.js';

const router = Router();

authenticator.options = { window: 1, step: 30 };

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'MISSING_CREDENTIALS' });
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      audit(user.id, 'login.fail', null, req.ip);
      return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    }
    if (user.totp_enabled) {
      // Issue a TOTP-pending token (no api access until verified)
      const token = signAccessToken(user);
      audit(user.id, 'login.success', null, req.ip);
      return res.json({ token, user: publicUser(user), requiresTotp: true });
    }
    // No 2FA enrolled — return a pre-2fa bootstrap token and let client call /setup-2fa
    const token = signAccessToken(user);
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(Date.now(), user.id);
    audit(user.id, 'login.success', null, req.ip);
    return res.json({ token, user: publicUser(user), requiresTotp: false });
  } catch (err) { next(err); }
});

router.post('/verify-2fa', requireAuth, async (req, res, next) => {
  try {
    if (!req.user.totp_enabled) return res.status(400).json({ error: 'TOTP_NOT_ENROLLED' });
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'MISSING_CODE' });
    const full = db.prepare('SELECT totp_secret FROM users WHERE id = ?').get(req.user.id);
    const ok = authenticator.verify({ token: code, secret: full.totp_secret });
    if (!ok) {
      audit(req.user.id, 'totp.fail', null, req.ip);
      return res.status(401).json({ error: 'INVALID_CODE' });
    }
    db.prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(Date.now(), req.user.id);
    audit(req.user.id, 'totp.success', null, req.ip);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/setup-2fa', requireAuth, async (req, res, next) => {
  try {
    if (req.user.totp_enabled) {
      return res.json({ alreadyEnabled: true });
    }
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(req.user.username, 'SOC//OPS v2', secret);
    const qrDataUrl = await QRCode.toDataURL(otpauth, { margin: 0, color: { dark: '#000000', light: '#ffffff' } });
    // Stash pending secret on the user row; not active until confirmed
    db.prepare('UPDATE users SET totp_secret = ? WHERE id = ?').run(secret, req.user.id);
    res.json({ otpauth, qrDataUrl, secret });
  } catch (err) { next(err); }
});

router.post('/confirm-2fa', requireAuth, async (req, res, next) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'MISSING_CODE' });
    const row = db.prepare('SELECT totp_secret FROM users WHERE id = ?').get(req.user.id);
    if (!row?.totp_secret) return res.status(400).json({ error: 'SETUP_REQUIRED' });
    const ok = authenticator.verify({ token: code, secret: row.totp_secret });
    if (!ok) return res.status(401).json({ error: 'INVALID_CODE' });
    db.prepare('UPDATE users SET totp_enabled = 1 WHERE id = ?').run(req.user.id);
    audit(req.user.id, 'totp.enroll', null, req.ip);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { current, next: nextPw } = req.body || {};
    if (!current || !nextPw) return res.status(400).json({ error: 'MISSING_FIELDS' });
    if (nextPw.length < 10) return res.status(400).json({ error: 'PASSWORD_TOO_SHORT' });
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    const ok = await bcrypt.compare(current, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'INVALID_CURRENT' });
    const hash = await bcrypt.hash(nextPw, 12);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
    audit(req.user.id, 'password.change', null, req.ip);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/logout', requireAuth, (req, res) => {
  audit(req.user.id, 'logout', null, req.ip);
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
