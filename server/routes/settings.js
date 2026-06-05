import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getSetting, setSetting } from '../db.js';

const router = Router();
router.use(requireAuth);

const DEFAULTS = {
  classification: 'RESTRICTED',
  notifications: { email: false, webhook: false, webhookUrl: '' },
  apiKeys: { vt: '', shodan: '', abuseipdb: '' },
};

router.get('/', (_req, res) => {
  res.json({
    classification: getSetting('classification', DEFAULTS.classification),
    notifications:  getSetting('notifications', DEFAULTS.notifications),
    apiKeys:        getSetting('apiKeys', DEFAULTS.apiKeys),
  });
});

router.put('/', (req, res) => {
  const { classification, notifications, apiKeys } = req.body || {};
  if (classification !== undefined) setSetting('classification', String(classification));
  if (notifications)  setSetting('notifications', notifications);
  if (apiKeys)        setSetting('apiKeys', apiKeys);
  res.json({ ok: true });
});

export default router;
