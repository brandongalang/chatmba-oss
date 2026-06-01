import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { schemaSql } from "./schema";

let db: Database.Database | null = null;

function databasePath(): string {
  const raw = process.env.DATABASE_URL ?? "file:./data/chatmba.db";
  if (!raw.startsWith("file:")) {
    throw new Error("chatmba-oss currently supports file: SQLite DATABASE_URL values.");
  }
  return resolve(/* turbopackIgnore: true */ process.cwd(), raw.slice("file:".length));
}

export function getDb(): Database.Database {
  if (db) return db;
  const path = databasePath();
  mkdirSync(dirname(path), { recursive: true });
  db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(schemaSql);
  return db;
}
