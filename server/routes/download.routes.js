import express from "express";
import { streamDownload } from "../controllers/download.controller.js";
import { concurrencyLimiter } from "../middleware/concurrencyLimiter.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/", rateLimiter, concurrencyLimiter, streamDownload);

export default router;
