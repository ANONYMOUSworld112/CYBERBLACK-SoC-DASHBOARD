import dns from 'node:dns/promises';
import { logger } from '../../utils/logger.js';

export default async function dnsLookup(indicator) {
  const target = String(indicator || '').trim();
  if (!target) return { error: 'MISSING_INDICATOR' };
  const result = { target, records: {} };
  try {
    result.records.a     = await dns.resolve4(target).catch((e) => `ERR:${e.code}`);
    result.records.aaaa  = await dns.resolve6(target).catch((e) => `ERR:${e.code}`);
    result.records.mx    = await dns.resolveMx(target).catch((e) => `ERR:${e.code}`);
    result.records.ns    = await dns.resolveNs(target).catch((e) => `ERR:${e.code}`);
    result.records.txt   = await dns.resolveTxt(target).catch((e) => `ERR:${e.code}`);
    result.records.cname = await dns.resolveCname(target).catch((e) => `ERR:${e.code}`);
    return result;
  } catch (err) {
    logger.warn('dns failed', { err: err.message, target });
    return { error: err.message };
  }
}
