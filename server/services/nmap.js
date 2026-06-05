import { spawn } from 'node:child_process';
import { logger } from '../utils/logger.js';
import { config } from '../config.js';

const INSECURE_PORTS = new Set([21, 23, 69, 135, 139, 445, 1433, 3389, 5900]);

export function isAvailable() {
  return Boolean(config.detection.nmapPath || which('nmap'));
}

function which(bin) {
  try {
    const { spawnSync } = require('node:child_process');
    const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [bin], { encoding: 'utf8' });
    return r.status === 0;
  } catch { return false; }
}

const PARSE_RE = /^(\d+)\/(\w+)\s+(\w+)\s+(\S+)(?:\s+(.*))?$/;

function parsePortLine(line) {
  const m = line.match(PARSE_RE);
  if (!m) return null;
  const [, port, proto, state, service, info] = m;
  const insecure = INSECURE_PORTS.has(Number(port));
  return {
    port: Number(port),
    proto,
    state,
    service,
    insecure,
    note: (info || '').trim() + (insecure ? ' ⚠ INSECURE' : ''),
  };
}

export default async function nmapScan(target) {
  if (!isAvailable()) {
    return { unavailable: true, reason: 'nmap binary not on PATH' };
  }
  return new Promise((resolve, reject) => {
    const args = ['-sS', '-Pn', '-T4', '--open', '-n', target];
    const bin = config.detection.nmapPath || 'nmap';
    const child = spawn(bin, args, { windowsHide: true });
    let output = '';
    let ports = [];
    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      for (const line of text.split('\n')) {
        const p = parsePortLine(line.trim());
        if (p) ports.push(p);
      }
    });
    child.stderr.on('data', (chunk) => {
      output += chunk.toString();
    });
    child.on('error', (err) => {
      logger.warn('nmap spawn failed', { err: err.message });
      resolve({ unavailable: true, reason: err.message });
    });
    child.on('close', (code) => {
      if (code !== 0 && !ports.length) {
        return resolve({ unavailable: true, reason: `nmap exit ${code}` });
      }
      resolve({ output, ports });
    });
  });
}
