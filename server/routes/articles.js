import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.get("/", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 10;
  const offset = (page - 1) * limit;
  const tag = req.query.tag || "";
  const q = req.query.q || "";

  let where = [];
  let params = [];

  if (tag) {
    where.push("tags LIKE ?");
    params.push(`%"${tag}"%`);
  }
  if (q) {
    where.push("(title LIKE ? OR content LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  const articles = db
    .prepare(
      `SELECT id, title, summary, tags, created_at, updated_at FROM articles ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  const { total } = db
    .prepare(`SELECT COUNT(*) as total FROM articles ${whereClause}`)
    .get(...params);

  res.json({ articles, total, page, totalPages: Math.ceil(total / limit) });
});

// Return all unique tags across all articles
router.get("/tags/all", (_req, res) => {
  const rows = db.prepare("SELECT tags FROM articles").all();
  const tagSet = new Set();
  for (const row of rows) {
    try {
      const arr = JSON.parse(row.tags || "[]");
      arr.forEach((t) => tagSet.add(t));
    } catch {
      // skip malformed tags
    }
  }
  res.json([...tagSet].sort());
});

router.get("/:id", (req, res) => {
  const article = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found" });
  res.json(article);
});

router.post("/", requireAuth, (req, res) => {
  const { title, content, summary, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  const safeTags = Array.isArray(tags) ? JSON.stringify(tags) : "[]";
  const result = db
    .prepare(
      "INSERT INTO articles (title, content, summary, tags) VALUES (?, ?, ?, ?)"
    )
    .run(title, content, summary || "", safeTags);
  const article = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(article);
});

router.put("/:id", requireAuth, (req, res) => {
  const { title, content, summary, tags } = req.body;
  const existing = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Article not found" });

  const safeTags =
    tags !== undefined
      ? Array.isArray(tags)
        ? JSON.stringify(tags)
        : existing.tags
      : existing.tags;

  db.prepare(
    "UPDATE articles SET title = ?, content = ?, summary = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(
    title || existing.title,
    content || existing.content,
    summary !== undefined ? summary : existing.summary,
    safeTags,
    req.params.id
  );

  const updated = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id);
  res.json(updated);
});

router.delete("/:id", requireAuth, (req, res) => {
  const existing = db
    .prepare("SELECT * FROM articles WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Article not found" });
  db.prepare("DELETE FROM articles WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});
export default router;
