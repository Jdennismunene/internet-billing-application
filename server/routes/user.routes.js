import express from "express";
import {
  getProfile,
  updateProfile,
  getUserBilling,
  getUserSpeedTests,
  getAllUsers,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifytoken.js";

const router = express.Router();
router.get("/getallusers", getAllUsers);
// get profile
router.get("/profile", verifyToken, getProfile);
// update profile
router.put("/profile", verifyToken, updateProfile);

// Get user's billing
router.get("/billing", verifyToken, getUserBilling);

// Get user's speed tests
router.get("/speed-tests", verifyToken, getUserSpeedTests);

export default router;
