import { Router } from "express";
import db from "../db.js";
import { requireAuth } from "../auth.js";

const router = Router();

router.get("/", (_req, res) => {
  const rows = db.prepare("SELECT key, value FROM profile").all();
  const profile = {};
  for (const r of rows) profile[r.key] = r.value;
  res.json(profile);
});

router.put("/", requireAuth, (req, res) => {
  const data = req.body;
  const upsert = db.prepare("INSERT INTO profile (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?");
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") upsert.run(key, value, value);
  }
  res.json({ success: true });
});

export default router;
