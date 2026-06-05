#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { openDb } from './server/db-shim.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const DATA_DIR = resolve(ROOT, 'data');
const DB_PATH = resolve(DATA_DIR, 'soc.db');
const ENV_PATH = resolve(ROOT, '.env');

function log(step, msg) {
  process.stdout.write(`[${String(step).padStart(2, '0')}] ${msg}\n`);
}

function ensureEnv() {
  if (existsSync(ENV_PATH)) {
    log(1, '.env already exists — leaving untouched');
    return readFileSync(ENV_PATH, 'utf8');
  }
  const example = readFileSync(resolve(ROOT, '.env.example'), 'utf8');
  const secret = crypto.randomBytes(48).toString('base64url');
  const next = example.replace('replace-me-with-output-of-setup-script', secret);
  writeFileSync(ENV_PATH, next, 'utf8');
  log(1, '.env created with freshly generated JWT_SECRET');
  return next;
}

function loadEnv(text) {
  const env = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function ensureDirs() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  log(2, `data/ ready at ${DATA_DIR}`);
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'analyst',
      totp_secret TEXT,
      totp_enabled INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      last_login_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      issued_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      ip TEXT,
      user_agent TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      severity TEXT NOT NULL CHECK(severity IN ('critical','high','medium','low')),
      source TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      indicator TEXT,
      status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','investigating','resolved','dismissed')),
      assignee_id INTEGER REFERENCES users(id),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
    CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
    CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);

    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'triage' CHECK(status IN ('triage','investigating','resolved')),
      severity TEXT NOT NULL,
      related_alerts TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tool TEXT NOT NULL,
      target TEXT NOT NULL,
      status TEXT NOT NULL,
      result TEXT,
      started_at INTEGER NOT NULL,
      finished_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS osint_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      indicator TEXT NOT NULL,
      kind TEXT NOT NULL,
      result TEXT NOT NULL,
      fetched_at INTEGER NOT NULL,
      UNIQUE(indicator, kind)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      target TEXT,
      ip TEXT,
      ts INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS packets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      src TEXT,
      dst TEXT,
      proto TEXT,
      port INTEGER,
      state TEXT,
      insecure INTEGER DEFAULT 0,
      note TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_packets_ts ON packets(ts DESC);
  `);
  log(3, 'schema migrated (users, sessions, alerts, incidents, scans, osint_cache, settings, audit_log, packets)');
}

async function seedAdmin(db, env) {
  const username = env.ADMIN_USERNAME || 'admin';
  const email = env.ADMIN_EMAIL || 'admin@local.soc';
  const password = env.ADMIN_PASSWORD || 'ChangeMe!2026';
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    log(4, `admin user "${username}" already exists — skipping seed`);
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  const now = Date.now();
  db.prepare(`
    INSERT INTO users (username, email, password_hash, role, totp_enabled, created_at)
    VALUES (?, ?, ?, 'admin', 0, ?)
  `).run(username, email, hash, now);
  log(4, `admin user created — username: ${username} / password: ${env.ADMIN_PASSWORD ? '<from .env>' : 'ChangeMe!2026'}`);
}

async function main() {
  const envText = ensureEnv();
  const env = loadEnv(envText);
  ensureDirs();
  const db = openDb(DB_PATH);
  try {
    migrate(db);
    await seedAdmin(db, env);
  } finally {
    db.close();
  }
  log(5, 'setup complete — run `npm run dev` to start');
}

main().catch((err) => {
  console.error('setup failed:', err);
  process.exit(1);
});
