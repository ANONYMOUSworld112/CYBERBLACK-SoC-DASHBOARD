import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', (req, res) => {
  const { severity, status, limit = 200 } = req.query;
  let sql = 'SELECT * FROM alerts WHERE 1=1';
  const params = [];
  if (severity && severity !== 'all') { sql += ' AND severity = ?'; params.push(severity); }
  if (status   && status   !== 'all') { sql += ' AND status = ?';   params.push(status);   }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(Number(limit) || 200);
  const alerts = db.prepare(sql).all(...params);
  res.json({ alerts });
});

router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { status, severity, assignee_id } = req.body || {};
  const existing = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'NOT_FOUND' });
  const next = {
    status: status ?? existing.status,
    severity: severity ?? existing.severity,
    assignee_id: assignee_id ?? existing.assignee_id,
    updated_at: Date.now(),
  };
  db.prepare('UPDATE alerts SET status = ?, severity = ?, assignee_id = ?, updated_at = ? WHERE id = ?')
    .run(next.status, next.severity, next.assignee_id, next.updated_at, id);
  const updated = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM alerts WHERE id = ?').run(id);
  res.json({ ok: true });
});

export default router;
