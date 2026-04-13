import { Router } from "express";
import {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  restorePlan,
} from "../controllers/plan.controller.js";

import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

//Public Routes
router.get("/", getAllPlans);
router.get("/:id", getPlanById);

//  Admin-Protected Routes
router.post("/", protect, adminOnly, createPlan);
router.put("/:id", protect, adminOnly, updatePlan);
router.delete("/:id", protect, adminOnly, deletePlan);
router.patch("/:id/restore", protect, adminOnly, restorePlan);

export default router;
