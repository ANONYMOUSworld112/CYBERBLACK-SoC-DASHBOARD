import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getHealth } from '../services/sysMonitor.js';

const router = Router();
router.use(requireAuth);

router.get('/health', async (_req, res, next) => {
  try { res.json(await getHealth()); }
  catch (err) { next(err); }
});

export default router;
