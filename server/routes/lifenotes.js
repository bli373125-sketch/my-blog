import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.get("/", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 10;
  const offset = (page - 1) * limit;

  const notes = db
    .prepare(
      "SELECT id, title, content, mood, image_url, created_at, updated_at FROM life_notes ORDER BY created_at DESC LIMIT ? OFFSET ?"
    )
    .all(limit, offset);

  const { total } = db
    .prepare("SELECT COUNT(*) as total FROM life_notes")
    .get();

  res.json({ notes, total, page, totalPages: Math.ceil(total / limit) });
});

router.get("/:id", (req, res) => {
  const note = db
    .prepare("SELECT * FROM life_notes WHERE id = ?")
    .get(req.params.id);
  if (!note) return res.status(404).json({ error: "Life note not found" });
  res.json(note);
});

router.post("/", requireAuth, (req, res) => {
  const { title, content, mood, image_url } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }
  const result = db
    .prepare(
      "INSERT INTO life_notes (title, content, mood, image_url) VALUES (?, ?, ?, ?)"
    )
    .run(title, content, mood || "", image_url || "");
  const note = db
    .prepare("SELECT * FROM life_notes WHERE id = ?")
    .get(result.lastInsertRowid);
  res.status(201).json(note);
});

router.put("/:id", requireAuth, (req, res) => {
  const { title, content, mood, image_url } = req.body;
  const existing = db
    .prepare("SELECT * FROM life_notes WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Life note not found" });

  db.prepare(
    "UPDATE life_notes SET title = ?, content = ?, mood = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).run(
    title !== undefined ? title : existing.title,
    content !== undefined ? content : existing.content,
    mood !== undefined ? mood : existing.mood,
    image_url !== undefined ? image_url : existing.image_url,
    req.params.id
  );

  const updated = db
    .prepare("SELECT * FROM life_notes WHERE id = ?")
    .get(req.params.id);
  res.json(updated);
});

router.delete("/:id", requireAuth, (req, res) => {
  const existing = db
    .prepare("SELECT * FROM life_notes WHERE id = ?")
    .get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Life note not found" });
  db.prepare("DELETE FROM life_notes WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

export default router;
