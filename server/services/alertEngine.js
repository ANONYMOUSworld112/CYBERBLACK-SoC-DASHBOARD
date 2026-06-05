import { db } from '../db.js';
import { logger } from '../utils/logger.js';
import { config } from '../config.js';

const cooldowns = new Map(); // key -> ts

function key(a) {
  return `${a.severity}|${a.source}|${a.indicator || a.title}`;
}

export function recordAlert(alert) {
  const now = Date.now();
  const k = key(alert);
  const last = cooldowns.get(k) || 0;
  if (now - last < config.detection.cooldownMs) return null;
  cooldowns.set(k, now);
  const row = {
    severity: alert.severity,
    source:   alert.source,
    title:    alert.title,
    summary:  alert.summary || null,
    indicator: alert.indicator || null,
    status:   alert.status || 'open',
    created_at: now,
    updated_at: now,
  };
  try {
    const info = db.prepare(`
      INSERT INTO alerts (severity, source, title, summary, indicator, status, created_at, updated_at)
      VALUES (@severity, @source, @title, @summary, @indicator, @status, @created_at, @updated_at)
    `).run(row);
    const inserted = { id: info.lastInsertRowid, ...row };
    return inserted;
  } catch (err) {
    logger.error('alert insert failed', { err: err.message });
    return null;
  }
}
