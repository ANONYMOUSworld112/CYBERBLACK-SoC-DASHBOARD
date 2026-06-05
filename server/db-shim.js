/**
 * SQLite shim. Uses `node:sqlite` (built into Node ≥ 22.5) when available,
 * which removes the need for a native build step on Windows / Linux / macOS.
 *
 * Exposes a `better-sqlite3`-style API so the rest of the server
 * can be written as if `better-sqlite3` were installed:
 *
 *   const db = openDb(path);
 *   db.pragma('journal_mode = WAL');
 *   db.exec('CREATE TABLE …');
 *   const rows = db.prepare('SELECT …').all(...params);
 *   const row  = db.prepare('SELECT …').get(...params);
 *   const info = db.prepare('INSERT …').run(...params);  // { lastInsertRowid, changes }
 *   db.close();
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

class Statement {
  constructor(stmt) {
    this._stmt = stmt;
  }
  all(...params) {
    const rows = this._stmt.all(...this._bind(params));
    return rows.map((r) => this._rowToObj(r));
  }
  get(...params) {
    const row = this._stmt.get(...this._bind(params));
    return row ? this._rowToObj(row) : undefined;
  }
  run(...params) {
    const result = this._stmt.run(...this._bind(params));
    return {
      lastInsertRowid: Number(result.lastInsertRowid),
      changes: Number(result.changes),
    };
  }
  _bind(params) {
    // node:sqlite binds by position; better-sqlite3 also takes positional.
    return params;
  }
  _rowToObj(row) {
    if (row && typeof row === 'object') {
      const out = {};
      for (const k of Object.keys(row)) {
        const v = row[k];
        out[k] = typeof v === 'bigint' ? Number(v) : v;
      }
      return out;
    }
    return row;
  }
}

class Db {
  constructor(path) {
    this._db = new DatabaseSync(path);
  }
  pragma(stmt) {
    try { this._db.exec(`PRAGMA ${stmt}`); } catch { /* ignore unknown pragmas */ }
  }
  exec(sql) { this._db.exec(sql); }
  prepare(sql) { return new Statement(this._db.prepare(sql)); }
  close() { try { this._db.close(); } catch { /* ignore */ } }
}

export function openDb(path) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return new Db(path);
}

export { Db, Statement };
