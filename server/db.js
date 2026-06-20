import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || __dirname;
const db = new Database(path.join(dataDir, "blog.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add tags column to existing tables that don't have it yet
const cols = db.prepare("PRAGMA table_info(articles)").all().map((c) => c.name);
if (!cols.includes("tags")) {
  db.exec("ALTER TABLE articles ADD COLUMN tags TEXT DEFAULT '[]'");
}

export default db;
