import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import articlesRouter from "./routes/articles.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/articles", articlesRouter);
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
