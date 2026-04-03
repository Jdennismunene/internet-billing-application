import express from "express";
import downloadController from "../controllers/download.controller.js";
import { concurrencyLimiter } from "../middleware/concurrencyLimiter.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get(
  "/",
  rateLimiter,
  concurrencyLimiter,
  downloadController.streamDownload,
);

export default router;