import express from "express";
import { saveResult, getResult } from "../controllers/results.controller.js";

const router = express.Router();

router.post("/", saveResult);
router.get("/:id", getResult);

export default router;
