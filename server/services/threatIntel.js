import { logger } from '../utils/logger.js';

const RECENT = []; // in-memory ring buffer of last 50 events

export function pushIntel(item) {
  const event = { id: RECENT.length + 1, ts: Date.now(), ...item };
  RECENT.unshift(event);
  if (RECENT.length > 50) RECENT.pop();
  return event;
}

export function listIntel(limit = 25) {
  return RECENT.slice(0, limit);
}

export function isIp(s) { return /^\d{1,3}(\.\d{1,3}){3}$/.test(s); }
export function isDomain(s) { return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(s); }
export function isHash(s) { return /^[a-f0-9]{32,64}$/i.test(s); }

export default async function threatIntel(indicator) {
  const ind = String(indicator || '').trim().toLowerCase();
  if (!ind) return { error: 'MISSING_INDICATOR' };
  const kind = isIp(ind) ? 'ip' : isHash(ind) ? 'hash' : isDomain(ind) ? 'domain' : 'unknown';
  // local heuristic: assign severity
  let severity = 'low';
  const reasons = [];
  if (kind === 'ip') {
    if (ind.startsWith('198.') || ind.startsWith('203.')) { severity = 'high'; reasons.push('IP in commonly-abused range'); }
    if (ind === '1.1.1.1' || ind === '8.8.8.8') { severity = 'low'; reasons.push('Well-known resolver'); }
  }
  if (kind === 'domain') {
    if (ind.endsWith('.zip') || ind.endsWith('.mov') || ind.endsWith('.top')) {
      severity = 'high'; reasons.push('Abused TLD');
    }
  }
  if (kind === 'hash') {
    if (ind === '44d88612fea8a8f36de82e1278abb02f') {
      severity = 'critical'; reasons.push('EICAR test signature');
    }
  }
  const event = pushIntel({ indicator: ind, kind, severity, title: `Intel · ${kind} · ${ind}` });
  logger.info('intel event', { indicator: ind, severity });
  return { kind, severity, reasons, indicator: ind, event };
}
