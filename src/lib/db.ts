import { DatabaseSync } from "node:sqlite";
import path from "node:path";

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(path.join(process.cwd(), "data/tools.db"));
    db.exec("PRAGMA journal_mode=WAL");
    db.exec("PRAGMA busy_timeout=5000");
    initTables();
  }
  return db;
}

function initTables() {
  const d = db!;
  d.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      original_url TEXT NOT NULL,
      clicks INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  d.exec(`
    CREATE INDEX IF NOT EXISTS idx_urls_slug ON urls(slug)
  `);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
