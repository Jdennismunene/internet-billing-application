import express from "express";
import resultsController from "../controllers/results.controller.js";

const router = express.Router();

router.post("/", resultsController.saveResult);
router.get("/:id", resultsController.getResult);

export default router;
