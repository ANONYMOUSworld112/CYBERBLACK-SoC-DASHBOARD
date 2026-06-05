#!/usr/bin/env node
/**
 * Cross-platform dev runner. Spawns the server and client in parallel
 * using `node` directly — no shell, no cmd.exe, no npm wrapper.
 *
 * This avoids two classes of failure:
 *   1. `concurrently` on Windows/PowerShell → `spawn cmd.exe ENOENT`
 *   2. `npm.cmd` on Windows requires `shell: true` (Node ≥ 20) and
 *      that breaks argument / cwd handling on some shells.
 *
 * The trade-off is we don't go through `npm run`, but the commands
 * here are trivial so we just inline them.
 */
import { spawn } from 'node:child_process';
import process from 'node:process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const node = process.execPath;
const isWin = process.platform === 'win32';

const viteBin = isWin
  ? join(ROOT, 'client', 'node_modules', 'vite', 'bin', 'vite.js')
  : join(ROOT, 'client', 'node_modules', '.bin', 'vite');

if (!existsSync(viteBin)) {
  process.stderr.write(
    `[runner] Vite not found at ${viteBin}.\n` +
    `[runner] Run: npm run install:all\n`,
  );
  process.exit(1);
}

const procs = [
  {
    name: 'SERVER',
    cwd: ROOT,
    args: ['--watch', 'server/index.js'],
    color: '\x1b[90m',
  },
  {
    name: 'CLIENT',
    cwd: join(ROOT, 'client'),
    args: [viteBin],
    color: '\x1b[37m',
  },
];

const RESET = '\x1b[0m';
const children = [];
let shuttingDown = false;

function tag(name, color) {
  return `${color}[${name}]${RESET}`;
}

function start({ name, cwd, args, color }) {
  // Pass NODE_ENV to children; most tooling expects this on dev runs.
  const env = { ...process.env, NODE_ENV: 'development' };
  const child = spawn(node, args, {
    cwd,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  children.push(child);

  const pipe = (stream) => {
    let buf = '';
    stream.on('data', (chunk) => {
      const text = buf + chunk.toString('utf8');
      const lines = text.split(/\r?\n/);
      buf = lines.pop() || '';
      for (const line of lines) {
        // Drop known-harmless noise from Windows-codec probes (e.g. systeminformation
        // calling `chcp` in environments where it isn't on PATH).
        if (/['"]?chcp['"]? is not recognized|operable program or batch file/i.test(line)) {
          continue;
        }
        process.stdout.write(`${tag(name, color)} ${line}\n`);
      }
    });
    stream.on('end', () => {
      if (buf && !/['"]?chcp['"]? is not recognized|operable program or batch file/i.test(buf)) {
        process.stdout.write(`${tag(name, color)} ${buf}\n`);
      }
    });
  };
  pipe(child.stdout);
  pipe(child.stderr);

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    process.stdout.write(
      `${tag(name, color)} exited code=${code ?? 'null'} signal=${signal ?? 'null'}\n`,
    );
    shutdown(code ?? 0);
  });
  child.on('error', (err) => {
    process.stdout.write(`${tag(name, color)} error: ${err.message}\n`);
    shutdown(1);
  });
}

function shutdown(code = 0) {
  shuttingDown = true;
  for (const c of children) {
    try { c.kill('SIGTERM'); } catch { /* ignore */ }
  }
  setTimeout(() => process.exit(code), 200);
}

process.on('SIGINT',  () => { process.stdout.write('SIGINT\n');  shutdown(130); });
process.on('SIGTERM', () => { process.stdout.write('SIGTERM\n'); shutdown(143); });
process.on('exit',    () => { for (const c of children) try { c.kill(); } catch {} });

for (const spec of procs) start(spec);
process.stdout.write(`SOC dev runner — server :4000, client :5173\n`);
