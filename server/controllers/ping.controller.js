import crypto from "crypto";

// In-memory token store (replace with Redis in production)
const tokens = new Map();

export const issueToken = (req, res) => {
  const token = crypto.randomBytes(16).toString("hex");
  const clientIp = req.ip;

  tokens.set(token, {
    ip: clientIp,
    expiresAt: Date.now() + 30_000, // 30 second TTL
  });

  return res.status(200).json({ token, expiresIn: 30 });
};

// Exported so WebSocket handler can validate tokens too
export const validateToken = (token, ip) => {
  const entry = tokens.get(token);
  if (!entry) return false;
  if (entry.ip !== ip) return false;
  if (Date.now() > entry.expiresAt) {
    tokens.delete(token);
    return false;
  }
  tokens.delete(token); // single-use
  return true;
};
