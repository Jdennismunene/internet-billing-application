import express from "express";
import {
  startTest,
  streamTestProgress,
  getTestStatus,
  submitResults,
} from "../controllers/SpeedTest.controller.js";
import {
  streamDownload,
  streamUpload,
} from "../controllers/stream.controller.js";

const router = express.Router();

// Measurement endpoints
router.get("/download", streamDownload);
router.post("/upload", streamUpload);

// Test lifecycle
router.post("/start", startTest); //tested
router.post("/submit/:id", submitResults);
router.get("/status/:id", getTestStatus);
router.get("/stream/:id", streamTestProgress);

export default router;
