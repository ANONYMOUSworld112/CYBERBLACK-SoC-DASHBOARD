import axios from 'axios';
import { config } from '../../config.js';
import { logger } from '../../utils/logger.js';

export default async function shodanLookup(indicator) {
  const target = String(indicator || '').trim();
  if (!target) return { error: 'MISSING_INDICATOR' };
  if (!config.keys.shodan) {
    return { error: 'SHODAN_API_KEY_MISSING', target, message: 'Configure SHODAN_API_KEY in .env to enable.' };
  }
  try {
    const r = await axios.get(`https://api.shodan.io/${isIp(target) ? 'host' : 'dns'}/${target}`, {
      params: { key: config.keys.shodan },
      timeout: 10000,
    });
    return { source: 'shodan', target, result: r.data };
  } catch (err) {
    logger.warn('shodan failed', { err: err.message, target });
    return { error: err.message, target };
  }
}

function isIp(s) { return /^\d{1,3}(\.\d{1,3}){3}$/.test(s); }
