import { Router } from "express";
import {
  createPlan,
  getAllPlans,
  getPlanByPackagePlan,
  updatePlan,
  deletePlan,
  restorePlan,
} from "../controllers/plan.controller.js";

import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

//Public Routes
router.get("/", getAllPlans); //tested
router.get("/:packageplan", getPlanByPackagePlan); // tested

//  Admin-Protected Routes
router.post("/", protect, adminOnly, createPlan); // tested
router.put("/:id", protect, adminOnly, updatePlan); //tested
router.delete("/:id", protect, adminOnly, deletePlan); //tested
router.patch("/:id/restore", protect, adminOnly, restorePlan); //tested

export default router;
