import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import whoisLookup from '../services/osint/whois.js';
import dnsLookup from '../services/osint/dns.js';
import shodanLookup from '../services/osint/shodan.js';
import threatLookup from '../services/threatIntel.js';

const router = Router();
router.use(requireAuth);

router.get('/whois', async (req, res, next) => {
  try { res.json(await whoisLookup(req.query.indicator)); }
  catch (err) { next(err); }
});

router.get('/dns', async (req, res, next) => {
  try { res.json(await dnsLookup(req.query.indicator)); }
  catch (err) { next(err); }
});

router.get('/shodan', async (req, res, next) => {
  try { res.json(await shodanLookup(req.query.indicator)); }
  catch (err) { next(err); }
});

router.get('/threat', async (req, res, next) => {
  try { res.json(await threatLookup(req.query.indicator)); }
  catch (err) { next(err); }
});

export default router;
