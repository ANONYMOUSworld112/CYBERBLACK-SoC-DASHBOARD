import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ENV_PATH = resolve(ROOT, '.env');

if (existsSync(ENV_PATH)) {
  for (const raw of readFileSync(ENV_PATH, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = val;
  }
}

export const config = {
  port: Number(process.env.PORT) || 4000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-env',
  jwtTtl: process.env.JWT_TTL || '12h',
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe!2026',
    email:    process.env.ADMIN_EMAIL    || 'admin@local.soc',
  },
  keys: {
    vt:       process.env.VT_API_KEY       || '',
    shodan:   process.env.SHODAN_API_KEY   || '',
    abuseipdb: process.env.ABUSEIPDB_API_KEY || '',
  },
  detection: {
    cooldownMs: Number(process.env.ALERT_COOLDOWN_MS) || 30000,
    capture: process.env.PACKET_CAPTURE_ENABLED || 'auto',
    nmapPath: process.env.NMAP_PATH || '',
  },
  dataDir: resolve(ROOT, 'data'),
  dbPath: resolve(ROOT, 'data', 'soc.db'),
};
