import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { scannerLimiter } from '../middleware/rateLimit.js';
import { db } from '../db.js';
import nmapScan from '../services/nmap.js';
import vulnScan from '../services/scanner.js';
import malwareCheck from '../services/malware.js';
import phishingCheck from '../services/phishing.js';
import { logger } from '../utils/logger.js';

const router = Router();
router.use(requireAuth);

function recordScan(tool, target, status, result) {
  try {
    const now = Date.now();
    db.prepare(`
      INSERT INTO scans (tool, target, status, result, started_at, finished_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(tool, target, status, typeof result === 'string' ? result : JSON.stringify(result), now, now);
  } catch (err) {
    logger.warn('recordScan failed', { err: err.message });
  }
}

router.post('/nmap', scannerLimiter, async (req, res, next) => {
  try {
    const { target } = req.body || {};
    if (!target) return res.status(400).json({ error: 'MISSING_TARGET' });
    const data = await nmapScan(target);
    recordScan('nmap', target, data.unavailable ? 'unavailable' : 'ok', data);
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/vuln', scannerLimiter, async (req, res, next) => {
  try {
    const { target, profile } = req.body || {};
    if (!target) return res.status(400).json({ error: 'MISSING_TARGET' });
    const data = await vulnScan(target, profile);
    recordScan('vuln', target, 'ok', data);
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/malware', scannerLimiter, async (req, res, next) => {
  try {
    const { hash } = req.body || {};
    if (!hash) return res.status(400).json({ error: 'MISSING_HASH' });
    const data = await malwareCheck(hash);
    recordScan('malware', hash, 'ok', data);
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/phishing', scannerLimiter, async (req, res, next) => {
  try {
    const { url } = req.body || {};
    if (!url) return res.status(400).json({ error: 'MISSING_URL' });
    const data = await phishingCheck(url);
    recordScan('phishing', url, 'ok', data);
    res.json(data);
  } catch (err) { next(err); }
});

export default router;
