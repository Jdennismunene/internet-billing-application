import express from "express";
import pingController from "../controllers/ping.controller.js";

const router = express.Router();

router.get("/token", pingController.issueToken);

export default router;
