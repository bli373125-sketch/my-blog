import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Generate a single token at startup, valid until server restart
const VALID_TOKEN = crypto.randomBytes(32).toString("hex");

export function loginHandler(req, res) {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    return res.json({ token: VALID_TOKEN });
  }
  res.status(401).json({ error: "Wrong password" });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (token && token === VALID_TOKEN) return next();
  res.status(401).json({ error: "Unauthorized" });
}
