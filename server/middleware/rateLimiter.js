import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1-minute window
  max: 10, // max 10 test requests per IP per minute
  message: { error: "Too many requests. Please wait before testing again." },
});
