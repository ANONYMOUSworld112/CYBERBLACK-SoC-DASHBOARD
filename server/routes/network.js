import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);

router.get('/talkers', (_req, res) => {
  const rows = db.prepare(`
    SELECT src AS ip, COUNT(*) AS flows, SUM(length(src)) AS bytes, 'AS0000' AS asn
    FROM packets
    WHERE ts > ?
    GROUP BY src
    ORDER BY flows DESC
    LIMIT 25
  `).all(Date.now() - 5 * 60 * 1000);
  res.json({ talkers: rows });
});

router.get('/protocols', (_req, res) => {
  const rows = db.prepare(`
    SELECT proto AS name, COUNT(*) AS value
    FROM packets
    WHERE ts > ?
    GROUP BY proto
    ORDER BY value DESC
  `).all(Date.now() - 5 * 60 * 1000);
  res.json({ protocols: rows });
});

router.get('/bandwidth', (_req, res) => {
  // 60 buckets, 1 minute each
  const now = Date.now();
  const buckets = new Array(60).fill(0).map((_, i) => {
    const t = now - (59 - i) * 60_000;
    return { t, label: new Date(t).toISOString().slice(11, 16), rx: 0, tx: 0 };
  });
  // Approximate per-minute packet rate as "rx" and a fraction as "tx"
  for (let i = 0; i < buckets.length; i += 1) {
    const start = buckets[i].t;
    const end = start + 60_000;
    const row = db.prepare(`
      SELECT COUNT(*) AS c
      FROM packets
      WHERE ts >= ? AND ts < ?
    `).get(start, end);
    const c = row?.c || 0;
    buckets[i].rx = c * 1200;             // ~1200 bytes synthetic per packet
    buckets[i].tx = Math.floor(c * 400);
  }
  res.json({ history: buckets });
});

router.get('/packets/recent', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const rows = db.prepare(`
    SELECT ts, src, dst, proto, port, state, insecure, note
    FROM packets
    ORDER BY ts DESC
    LIMIT ?
  `).all(limit);
  res.json({ packets: rows.reverse() });
});

export default router;
