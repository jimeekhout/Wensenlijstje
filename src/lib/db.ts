import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const globalForDb = globalThis as unknown as { wensenlijstjeDb?: DatabaseSync };

function databaseFile(): string {
  return process.env.WENSENLIJSTJE_DB ?? path.join(process.cwd(), "data", "wensenlijstje.db");
}

function migrate(db: DatabaseSync): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS wishlists (
      id TEXT PRIMARY KEY,
      owner_token TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      occasion TEXT,
      revision INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      url TEXT,
      price_cents INTEGER,
      image_url TEXT,
      note TEXT,
      priority TEXT,
      position INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS items_wishlist_position ON items (wishlist_id, position);

    CREATE TABLE IF NOT EXISTS reservations (
      item_id TEXT PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
      status TEXT NOT NULL,
      reserver_name TEXT,
      visitor_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export function getDb(): DatabaseSync {
  if (globalForDb.wensenlijstjeDb) return globalForDb.wensenlijstjeDb;
  const file = databaseFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  migrate(db);
  globalForDb.wensenlijstjeDb = db;
  return db;
}

export function transaction<T>(fn: () => T): T {
  const db = getDb();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = fn();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // The original error is the one that matters.
    }
    throw error;
  }
}

export function clearAllData(): void {
  const db = getDb();
  db.exec("DELETE FROM reservations; DELETE FROM items; DELETE FROM wishlists;");
}
