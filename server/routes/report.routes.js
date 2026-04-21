import express from "express";
import {
  getPackagesReport,
  getPackageFilterOptions,
  getUsersReport,
  getUserFilterOptions,
  getPaymentsReport,
  getPaymentFilterOptions,
  generateReport,
} from "../controllers/report.controller.js";

import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// All report routes are admin-protected
router.use(protect, adminOnly);

// ─── PACKAGES
// GET /api/admin/reports/packages
// GET /api/admin/reports/packages/filter-options
router.get("/packages/filter-options", getPackageFilterOptions);
router.get("/packages", getPackagesReport);

// ─── USERS
// GET /api/admin/reports/users
// GET /api/admin/reports/users/filter-options
router.get("/users/filter-options", getUserFilterOptions);
router.get("/users", getUsersReport);

// ─── PAYMENTS
// GET /api/admin/reports/payments
// GET /api/admin/reports/payments/filter-options
router.get("/payments/filter-options", getPaymentFilterOptions);
router.get("/payments", getPaymentsReport);

// ─── GENERATE (for export)
router.post("/generate", generateReport);

export default router;
