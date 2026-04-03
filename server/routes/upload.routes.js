import express from "express";
import uploadController from "../controllers/upload.controller.js";
import { concurrencyLimiter } from "../middleware/concurrencyLimiter.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post(
  "/",
  rateLimiter,
  concurrencyLimiter,
  uploadController.receiveUpload,
);

export default router;
