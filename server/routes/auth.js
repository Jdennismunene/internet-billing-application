import express from "express";
const router = express.Router();
import {
  signup,
  verifyEmail,
  logout,
  login,
  forgotPassword,
  resetPassword,
  checkAuth,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";
router.get("/check-auth", verifyToken, checkAuth);
router.post("/signup", signup);
router.post("/verify-email", verifyEmail);
router.post("/logout", logout);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
