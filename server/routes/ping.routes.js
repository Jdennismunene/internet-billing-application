import express from "express";
import { issueToken } from "../controllers/ping.controller.js";

const router = express.Router();

router.get("/token", issueToken);

export default router;
