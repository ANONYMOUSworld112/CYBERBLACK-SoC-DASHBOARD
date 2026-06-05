import { SEVERITY_RANK } from './severity.js';

/**
 * Compute a 0-100 risk score from a sample of alerts.
 * Critical = 25, High = 10, Medium = 4, Low = 1
 * Normalised against a moving window cap of 200 points.
 */
export function computeRisk(alerts = []) {
  if (!alerts.length) return 0;
  const recent = alerts.slice(0, 100);
  const raw = recent.reduce((acc, a) => {
    const s = a.severity || 'low';
    return acc + ({ critical: 25, high: 10, medium: 4, low: 1 }[s] || 0);
  }, 0);
  const score = Math.min(100, Math.round((raw / 200) * 100));
  return score;
}

export function riskLevel(score) {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  return 'low';
}

export function severityWeight(s) {
  return SEVERITY_RANK[s] || 0;
}
