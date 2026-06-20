import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import articlesRouter from "./routes/articles.js";
import commentsRouter from "./routes/comments.js";
import profileRouter from "./routes/profile.js";
import uploadRouter from "./routes/upload.js";
import { loginHandler } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/api/auth/login", loginHandler);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/upload", uploadRouter);
const dataDir = process.env.DATA_DIR || __dirname;
app.use("/uploads", express.static(path.join(dataDir, "uploads")));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Serve frontend static files in production
const clientDist = path.resolve(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Blog server running on http://localhost:${PORT}`);
});
