import { Router } from "express";
import {
  generateBilling,
  getAllBillings,
  getBillingById,
  getUserBillings,
  markAsPaid,
  markOverdueBillings,
  deleteBilling,
  getBillingSummary,
} from "../controllers/billing.controller.js";

import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

// ─── Admin Routes ────────────────────────────────────────────────────────────
router.post("/", protect, adminOnly, generateBilling);
router.get("/", protect, adminOnly, getAllBillings);
router.get("/summary", protect, adminOnly, getBillingSummary);
router.patch("/mark-overdue", protect, adminOnly, markOverdueBillings);
router.delete("/:id", protect, adminOnly, deleteBilling);

// ─── User + Admin Routes ─────────────────────────────────────────────────────
router.get("/user/:userId", protect, getUserBillings);
router.get("/:id", protect, getBillingById);
router.patch("/:id/pay", protect, markAsPaid);

export default router;
