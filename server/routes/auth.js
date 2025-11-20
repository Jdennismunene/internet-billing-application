import express from "express";
const router = express.Router();
import {
  signup,
  verifyEmail,
  // logout,
  // login,
} from "../controllers/auth.controller.js";
router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
// router.post("/logout", logout);
// router.post("/login", login);

export default router;
