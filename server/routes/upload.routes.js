import express from "express";
import { receiveUpload } from "../controllers/upload.controller.js";
import { concurrencyLimiter } from "../middleware/concurrencyLimiter.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post(
  "/",
  express.raw({ type: "application/octet-stream", limit: "100mb" }),
  rateLimiter,
  receiveUpload,
);

export default router;
