import { URL } from 'node:url';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { logger } from '../utils/logger.js';

const SUSPICIOUS_TLDS = new Set(['zip', 'mov', 'top', 'click', 'country', 'kim', 'work', 'gq', 'ml']);
const BRAND_HOMOGLYPHS = ['paypa1', 'g00gle', 'micros0ft', 'amaz0n', 'app1e', 'faceb00k', 'netfl1x'];

export default async function phishingCheck(url) {
  const signals = [];
  let score = 0;
  let parsed;
  try { parsed = new URL(url); } catch {
    return { url, verdict: 'invalid-url', score: 100, signals: ['Malformed URL'] };
  }
  if (parsed.protocol !== 'https:') {
    signals.push('Insecure protocol (HTTP)');
    score += 25;
  }
  if (SUSPICIOUS_TLDS.has(parsed.hostname.split('.').pop())) {
    signals.push(`Suspicious TLD: .${parsed.hostname.split('.').pop()}`);
    score += 30;
  }
  for (const h of BRAND_HOMOGLYPHS) {
    if (parsed.hostname.toLowerCase().includes(h)) {
      signals.push(`Brand homoglyph pattern: ${h}`);
      score += 35;
    }
  }
  if (parsed.hostname.length > 30) {
    signals.push('Unusually long hostname');
    score += 10;
  }
  if ((parsed.hostname.match(/-/g) || []).length >= 3) {
    signals.push('Multiple hyphens in hostname');
    score += 10;
  }
  if (/\d{2,}/.test(parsed.hostname.split('.').slice(-2, -1)[0] || '')) {
    signals.push('Numbers in domain label');
    score += 8;
  }
  if (parsed.pathname.includes('@') || parsed.pathname.includes('//')) {
    signals.push('Path contains @ or //');
    score += 15;
  }
  if (parsed.search) {
    for (const k of ['redirect', 'url', 'next', 'return']) {
      if (parsed.searchParams.has(k)) {
        signals.push(`Open-redirect parameter: ${k}`);
        score += 12;
      }
    }
  }
  // Fetch HTML for additional signals (best-effort, short timeout)
  try {
    const r = await axios.get(url, { timeout: 5000, maxRedirects: 3, validateStatus: () => true });
    if (r.status >= 400) {
      signals.push(`HTTP ${r.status}`);
      score += 5;
    }
    if (typeof r.data === 'string') {
      const $ = cheerio.load(r.data);
      const title = $('title').first().text();
      if (/verify|secure|login|update|wallet|metamask/i.test(title)) {
        signals.push('Login-themed page title');
        score += 10;
      }
      const forms = $('form[action]').length;
      if (forms > 0) {
        signals.push(`${forms} form(s) present`);
      }
    }
  } catch (err) {
    signals.push(`Fetch error: ${err.message}`);
  }

  const verdict = score >= 50 ? 'likely-phishing' : score >= 25 ? 'suspicious' : 'likely-clean';
  return { url, verdict, score: Math.min(100, score), signals };
}
