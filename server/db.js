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

db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER NOT NULL,
    author TEXT NOT NULL DEFAULT '匿名',
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS profile (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  )
`);

// Seed default profile if empty
const profileCount = db.prepare("SELECT COUNT(*) as c FROM profile").get().c;
if (profileCount === 0) {
  const defaults = [
    ["name", "你的名字"],
    ["bio", "欢迎来到我的博客！这里是我记录想法、分享经验和展示项目的地方。"],
    ["avatar", ""],
    ["email", "your-email@example.com"],
    ["github", "github.com/your-username"],
    ["skills", "React, Node.js, Python"],
  ];
  const insert = db.prepare("INSERT OR IGNORE INTO profile (key, value) VALUES (?, ?)");
  for (const [k, v] of defaults) {
    insert.run(k, v);
  }
}

export default db;
