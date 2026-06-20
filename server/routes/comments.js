import { Router } from "express";
import db from "../db.js";

const router = Router();

router.get("/article/:articleId", (req, res) => {
  const comments = db
    .prepare("SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC")
    .all(req.params.articleId);
  res.json(comments);
});

router.post("/article/:articleId", (req, res) => {
  const { author, content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Content is required" });
  }
  const result = db
    .prepare("INSERT INTO comments (article_id, author, content) VALUES (?, ?, ?)")
    .run(req.params.articleId, (author || "匿名").trim() || "匿名", content.trim());
  const comment = db.prepare("SELECT * FROM comments WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(comment);
});

export default router;
