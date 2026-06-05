import whois from 'whois-json';
import { logger } from '../../utils/logger.js';

export default async function whoisLookup(indicator) {
  const target = String(indicator || '').trim();
  if (!target) return { error: 'MISSING_INDICATOR' };
  try {
    const data = await whois(target);
    return { source: 'whois', target, result: data };
  } catch (err) {
    logger.warn('whois failed', { err: err.message, target });
    return { error: err.message };
  }
}
