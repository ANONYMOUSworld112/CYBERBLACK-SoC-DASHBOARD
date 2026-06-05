import { format, formatDistanceToNow } from 'date-fns';

export function formatBytes(bytes) {
  if (bytes == null || isNaN(bytes)) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i += 1; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatRate(bps) {
  if (bps == null) return '—';
  return `${formatBytes(bps)}/s`;
}

export function formatNumber(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatUtc(d) {
  if (!d) return '—';
  return format(new Date(d), 'yyyy-MM-dd HH:mm:ss');
}

export function formatUptime(seconds) {
  if (seconds == null) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

export function relativeTime(ts) {
  if (!ts) return '—';
  return formatDistanceToNow(new Date(ts), { addSuffix: true });
}

export function truncate(str, n = 32) {
  if (!str) return '';
  return str.length > n ? `${str.slice(0, n - 1)}…` : str;
}

export function shortenHash(h, head = 8, tail = 6) {
  if (!h) return '';
  if (h.length <= head + tail + 1) return h;
  return `${h.slice(0, head)}…${h.slice(-tail)}`;
}
