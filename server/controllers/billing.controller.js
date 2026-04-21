import mongoose from "mongoose";
import Billing from "../models/billing.js";
import Plan from "../models/Plan.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const sendResponse = (res, statusCode, success, message, data = null) => {
  const payload = { success, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

/**
 * Computes dueDate based on startDate and plan duration.
 * Adds (duration * 30) days as a billing-cycle approximation.
 */
const computeDueDate = (startDate, durationMonths) => {
  const due = new Date(startDate);
  due.setMonth(due.getMonth() + durationMonths);
  return due;
};

/**
 * Derives YYYY-MM billing month string from a Date object.
 */
const toBillingMonth = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * @desc    Generate a billing record for a user/plan
 * @route   POST /api/billing
 * @access  Private (Admin)
 */
export const generateBilling = asyncHandler(async (req, res) => {
  const { user, plan: planId, startDate, paymentMethod } = req.body;

  // Validate plan exists and is active
  const plan = await Plan.findById(planId);
  if (!plan) return sendResponse(res, 404, false, "Plan not found");
  if (!plan.isActive)
    return sendResponse(res, 400, false, "Cannot bill for an inactive plan");

  const start = startDate ? new Date(startDate) : new Date();
  const dueDate = computeDueDate(start, plan.duration);
  const billingMonth = toBillingMonth(start);

  // Guard against duplicate billing
  const duplicate = await Billing.findOne({ user, plan: planId, billingMonth });
  if (duplicate) {
    return sendResponse(
      res,
      409,
      false,
      `A billing record for this user and plan already exists for ${billingMonth}`,
    );
  }

  const billing = await Billing.create({
    user,
    plan: planId,
    amount: plan.price,
    billingMonth,
    startDate: start,
    dueDate,
    paymentMethod: paymentMethod || null,
    status: "unpaid",
  });

  await billing.populate(["user", "plan"]);

  return sendResponse(
    res,
    201,
    true,
    "Billing record generated successfully",
    billing,
  );
});

/**
 * @desc    Get all billing records (with filters)
 * @route   GET /api/billing
 * @access  Private (Admin)
 */
export const getAllBillings = asyncHandler(async (req, res) => {
  const { status, user, plan, month, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (user) filter.user = user;
  if (plan) filter.plan = plan;
  if (month) filter.billingMonth = month;

  const skip = (Number(page) - 1) * Number(limit);

  const [billings, total] = await Promise.all([
    Billing.find(filter)
      .populate("user", "name email phone")
      .populate("plan", "name speed price duration")
      .sort({ generatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Billing.countDocuments(filter),
  ]);

  return sendResponse(res, 200, true, "Billing records retrieved", {
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    billings,
  });
});

/**
 * @desc    Get a single billing record by ID
 * @route   GET /api/billing/:id
 * @access  Private
 */
export const getBillingById = asyncHandler(async (req, res) => {
  const billing = await Billing.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("plan", "name speed price duration")
    .lean();

  if (!billing)
    return sendResponse(res, 404, false, "Billing record not found");

  return sendResponse(res, 200, true, "Billing record retrieved", billing);
});

/**
 * @desc    Get all billing records for a specific user
 * @route   GET /api/billing/user/:userId
 * @access  Private
 */
export const getUserBillings = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.query;

  const filter = { user: userId };
  if (status) filter.status = status;

  const billings = await Billing.find(filter)
    .populate("plan", "name speed price duration")
    .sort({ generatedAt: -1 })
    .lean();

  const summary = {
    total: billings.length,
    totalAmount: billings.reduce((sum, b) => sum + b.amount, 0),
    unpaid: billings.filter((b) => b.status === "unpaid").length,
    paid: billings.filter((b) => b.status === "paid").length,
    overdue: billings.filter((b) => b.status === "overdue").length,
  };

  return sendResponse(res, 200, true, "User billing records retrieved", {
    summary,
    billings,
  });
});

/**
 * @desc    Mark a billing record as paid
 * @route   PATCH /api/billing/:id/pay
 * @access  Private
 */
export const markAsPaid = asyncHandler(async (req, res) => {
  const { paymentMethod } = req.body;

  if (!paymentMethod) {
    return sendResponse(
      res,
      400,
      false,
      "Payment method is required to mark as paid",
    );
  }

  const billing = await Billing.findById(req.params.id);
  if (!billing)
    return sendResponse(res, 404, false, "Billing record not found");

  if (billing.status === "paid") {
    return sendResponse(
      res,
      400,
      false,
      "This billing record is already marked as paid",
    );
  }

  billing.status = "paid";
  billing.paymentMethod = paymentMethod;
  billing.paidAt = new Date();
  await billing.save();

  await billing.populate([
    { path: "user", select: "name email" },
    { path: "plan", select: "name price" },
  ]);

  return sendResponse(res, 200, true, "Payment recorded successfully", billing);
});

/**
 * @desc    Bulk update overdue billing records (cron-friendly)
 * @route   PATCH /api/billing/mark-overdue
 * @access  Private (Admin / System)
 */
export const markOverdueBillings = asyncHandler(async (req, res) => {
  const now = new Date();

  const result = await Billing.updateMany(
    { status: "unpaid", dueDate: { $lt: now } },
    { $set: { status: "overdue" } },
  );

  return sendResponse(res, 200, true, "Overdue billings updated", {
    modifiedCount: result.modifiedCount,
  });
});

/**
 * @desc    Delete a billing record (Admin only — unpaid/overdue only)
 * @route   DELETE /api/billing/:id
 * @access  Private (Admin)
 */
export const deleteBilling = asyncHandler(async (req, res) => {
  const billing = await Billing.findById(req.params.id);
  if (!billing)
    return sendResponse(res, 404, false, "Billing record not found");

  if (billing.status === "paid") {
    return sendResponse(
      res,
      400,
      false,
      "Paid billing records cannot be deleted",
    );
  }

  await billing.deleteOne();

  return sendResponse(res, 200, true, "Billing record deleted successfully");
});

/**
 * @desc    Get billing revenue summary (aggregation)
 * @route   GET /api/billing/summary
 * @access  Private (Admin)
 */
export const getBillingSummary = asyncHandler(async (req, res) => {
  const { month } = req.query;
  const matchStage = month ? { billingMonth: month } : {};

  const summary = await Billing.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
    {
      $project: {
        status: "$_id",
        count: 1,
        totalAmount: 1,
        _id: 0,
      },
    },
  ]);

  const revenueByMonth = await Billing.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: "$billingMonth",
        revenue: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
    { $limit: 12 },
    { $project: { month: "$_id", revenue: 1, count: 1, _id: 0 } },
  ]);

  return sendResponse(res, 200, true, "Billing summary retrieved", {
    byStatus: summary,
    revenueByMonth,
  });
});
