import Plan from "../models/plan.js";
import User from "../models/user.js";
import Payment from "../models/payment.js";

// ─── Helper: build filter object from query params ────────────────────────────

/**
 * Plan schema fields: packageplan, packagename, packageduration,
 *                     packagespeed, price, dataLimit, duration, isActive
 */
const buildPlanFilter = (query) => {
  const filter = {};

  if (query.packagename && query.packagename !== "All")
    filter.packagename = { $regex: query.packagename, $options: "i" };

  if (query.packageplan && query.packageplan !== "All")
    filter.packageplan = { $regex: query.packageplan, $options: "i" };

  if (query.packagespeed && query.packagespeed !== "All")
    filter.packagespeed = query.packagespeed;

  if (query.price && query.price !== "Other" && query.price !== "All")
    filter.price = query.price; // stored as String in schema

  if (query.packageduration && query.packageduration !== "All")
    filter.packageduration = query.packageduration;

  if (query.dataLimit && query.dataLimit !== "All")
    filter.dataLimit = query.dataLimit;

  if (query.isActive !== undefined && query.isActive !== "All")
    filter.isActive = query.isActive === "true";

  return filter;
};

/**
 * User schema fields: username, phone, email, gender,
 *                     location, plan (ObjectId → Plan), status, isVerified, role
 */
const buildUserFilter = (query) => {
  const filter = {};

  if (query.username && query.username !== "All")
    filter.username = { $regex: query.username, $options: "i" };

  if (query.plan && query.plan !== "All")
    filter.plan = query.plan; // ObjectId string

  if (query.status && query.status !== "Other" && query.status !== "All")
    filter.status = query.status; // 'active' | 'inactive'

  if (query.gender && query.gender !== "All")
    filter.gender = query.gender;

  if (query.isVerified !== undefined && query.isVerified !== "All")
    filter.isVerified = query.isVerified === "true";

  return filter;
};

/**
 * Payment schema fields: paymentCode, paymentMethod, name, amount
 * (update these if your Payment model differs)
 */
const buildPaymentFilter = (query) => {
  const filter = {};

  if (query.paymentCode && query.paymentCode !== "All")
    filter.paymentCode = { $regex: query.paymentCode, $options: "i" };

  if (query.paymentMethod && query.paymentMethod !== "All")
    filter.paymentMethod = query.paymentMethod;

  if (query.name && query.name !== "All")
    filter.name = { $regex: query.name, $options: "i" };

  if (query.amount && query.amount !== "Other" && query.amount !== "All")
    filter.amount = Number(query.amount);

  return filter;
};

// ─── PLANS REPORT (tab: "Packages") ──────────────────────────────────────────

/**
 * GET /api/admin/reports/packages
 * Query: packagename, packageplan, packagespeed, price, packageduration, dataLimit, isActive
 */
export const getPackagesReport = async (req, res) => {
  try {
    const filter = buildPlanFilter(req.query);

    const plans = await Plan.find(filter).sort({ createdAt: -1 });

    // price is a String in schema → cast to number for aggregation
    const summary = await Plan.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          avgPrice:   { $avg: { $toDouble: "$price" } },
          minPrice:   { $min: { $toDouble: "$price" } },
          maxPrice:   { $max: { $toDouble: "$price" } },
          avgDuration:{ $avg: "$duration" },
        },
      },
    ]);

    // Count per packageplan tier (e.g. "Basic", "Premium")
    const byPlanTier = await Plan.aggregate([
      { $match: filter },
      { $group: { _id: "$packageplan", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      report: "packages",
      summary: summary[0] || {},
      byPlanTier,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/packages/filter-options
 * Returns all distinct values for Plan dropdowns
 */
export const getPackageFilterOptions = async (req, res) => {
  try {
    const [packagenames, packageplans, packagespeeds, prices, packagedurations, dataLimits] =
      await Promise.all([
        Plan.distinct("packagename"),
        Plan.distinct("packageplan"),
        Plan.distinct("packagespeed"),
        Plan.distinct("price"),
        Plan.distinct("packageduration"),
        Plan.distinct("dataLimit"),
      ]);

    return res.status(200).json({
      success: true,
      options: {
        packagenames,
        packageplans,
        packagespeeds,
        prices,
        packagedurations,
        dataLimits,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── USERS REPORT ─────────────────────────────────────────────────────────────

/**
 * GET /api/admin/reports/users
 * Query: username, plan (ObjectId), status, gender, isVerified
 */
export const getUsersReport = async (req, res) => {
  try {
    const filter = buildUserFilter(req.query);
    filter.role = "user"; // always exclude admins

    const users = await User.find(filter)
      .populate(
        "plan",                                                      // ← User.plan → Plan
        "packagename packageplan packagespeed price packageduration" // ← exact Plan fields
      )
      .select(
        "-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt"
      )
      .sort({ createdAt: -1 });

    // Status breakdown: active / inactive
    const statusSummary = await User.aggregate([
      { $match: { ...filter } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Gender breakdown
    const genderSummary = await User.aggregate([
      { $match: { ...filter } },
      { $group: { _id: "$gender", count: { $sum: 1 } } },
    ]);

    // Verified vs unverified
    const verifiedSummary = await User.aggregate([
      { $match: { ...filter } },
      { $group: { _id: "$isVerified", count: { $sum: 1 } } },
    ]);

    return res.status(200).json({
      success: true,
      report: "users",
      summary: {
        statusBreakdown:   statusSummary,
        genderBreakdown:   genderSummary,
        verifiedBreakdown: verifiedSummary,
      },
      count: users.length,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/users/filter-options
 */
export const getUserFilterOptions = async (req, res) => {
  try {
    const baseFilter = { role: "user" };

    const [usernames, planIds, statuses, genders] = await Promise.all([
      User.distinct("username", baseFilter),
      User.distinct("plan", baseFilter),    // ObjectId list
      User.distinct("status", baseFilter),  // ['active', 'inactive']
      User.distinct("gender", baseFilter),  // ['male', 'female', 'other']
    ]);

    // Hydrate plan ObjectIds so frontend can show names in dropdown
    const planDetails = await Plan.find({ _id: { $in: planIds } })
      .select("packagename packageplan packagespeed price")
      .lean();

    return res.status(200).json({
      success: true,
      options: {
        usernames,
        plans: planDetails, // [{ _id, packagename, packageplan, packagespeed, price }]
        statuses,
        genders,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PAYMENTS REPORT ─────────────────────────────────────────────────────────

/**
 * GET /api/admin/reports/payments
 * Query: paymentCode, paymentMethod, name, amount
 */
export const getPaymentsReport = async (req, res) => {
  try {
    const filter = buildPaymentFilter(req.query);

    const payments = await Payment.find(filter)
      .populate("user", "username email phone") // ← User fields
      .populate("plan", "packagename packageplan price") // ← Plan fields via Payment.plan
      .sort({ createdAt: -1 });

    // Financial summary
    const summary = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount:    { $sum: "$amount" },
          totalPayments:  { $sum: 1 },
          avgAmount:      { $avg: "$amount" },
          minAmount:      { $min: "$amount" },
          maxAmount:      { $max: "$amount" },
        },
      },
    ]);

    // Breakdown by payment method
    const byMethod = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id:   "$paymentMethod",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      report: "payments",
      summary: summary[0] || {},
      byMethod,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/admin/reports/payments/filter-options
 */
export const getPaymentFilterOptions = async (req, res) => {
  try {
    const [paymentCodes, paymentMethods, names, amounts] = await Promise.all([
      Payment.distinct("paymentCode"),
      Payment.distinct("paymentMethod"),
      Payment.distinct("name"),
      Payment.distinct("amount"),
    ]);

    return res.status(200).json({
      success: true,
      options: { paymentCodes, paymentMethods, names, amounts },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GENERATE / EXPORT REPORT ─────────────────────────────────────────────────

/**
 * POST /api/admin/reports/generate
 * Body: { type: 'packages' | 'users' | 'payments', filters: {} }
 */
export const generateReport = async (req, res) => {
  try {
    const { type, filters = {} } = req.body;

    let data    = [];
    let summary = {};

    if (type === "packages") {
      // ── Plans ──────────────────────────────────────────────────────────────
      const filter = buildPlanFilter(filters);
      data = await Plan.find(filter).lean();

      const agg = await Plan.aggregate([
        { $match: filter },
        {
          $group: {
            _id:       null,
            totalPlans: { $sum: 1 },
            avgPrice:  { $avg: { $toDouble: "$price" } },
          },
        },
      ]);
      summary = agg[0] || {};

    } else if (type === "users") {
      // ── Users ──────────────────────────────────────────────────────────────
      const filter = buildUserFilter(filters);
      filter.role = "user";

      data = await User.find(filter)
        .populate("plan", "packagename packageplan price") // ← 'plan' field on User
        .select(
          "-password -resetPasswordToken -resetPasswordExpiresAt -verificationToken -verificationTokenExpiresAt"
        )
        .lean();

      const agg = await User.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);
      summary = { statusBreakdown: agg };

    } else if (type === "payments") {
      // ── Payments ───────────────────────────────────────────────────────────
      const filter = buildPaymentFilter(filters);

      data = await Payment.find(filter)
        .populate("user", "username email phone")
        .populate("plan", "packagename price")
        .lean();

      const agg = await Payment.aggregate([
        { $match: filter },
        {
          $group: {
            _id:        null,
            totalAmount:{ $sum: "$amount" },
            totalCount: { $sum: 1 },
          },
        },
      ]);
      summary = agg[0] || {};

    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid report type. Use: packages | users | payments",
      });
    }

    return res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      type,
      summary,
      count: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};