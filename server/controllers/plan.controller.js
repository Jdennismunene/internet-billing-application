import Plan from "../models/Plan.js";

// ─── Helpers ─────────────────────────────────────────────

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const sendResponse = (res, statusCode, success, message, data = null) => {
  const payload = { success, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

// ─── CREATE PLAN ─────────────────────────────────────────

export const createPlan = asyncHandler(async (req, res) => {
  const {
    packageplan,
    packagename,
    packageduration,
    packagespeed,
    price,
    dataLimit,
    description,
    duration,
  } = req.body;

  const existingName = await Plan.findOne({
    packagename: packagename?.trim(),
  });

  if (existingName) {
    return sendResponse(
      res,
      409,
      false,
      `A plan "${packagename}" already exists`,
    );
  }

  const plan = await Plan.create({
    packageplan,
    packagename,
    packageduration,
    packagespeed,
    price,
    dataLimit,
    description,
    duration,
  });

  return sendResponse(res, 201, true, "Plan created successfully", plan);
});

// ─── GET ALL PLANS ───────────────────────────────────────

export const getAllPlans = asyncHandler(async (req, res) => {
  const { active, minPrice, maxPrice, sort = "price" } = req.query;

  const filter = {};

  if (active !== undefined) {
    filter.isActive = active === "true";
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const allowedSorts = [
    "price",
    "-price",
    "packagename",
    "-packagename",
    "createdAt",
    "-createdAt",
  ];

  const sortField = allowedSorts.includes(sort) ? sort : "price";

  const plans = await Plan.find(filter).sort(sortField).lean();

  return sendResponse(res, 200, true, "Plans retrieved successfully", {
    count: plans.length,
    plans,
  });
});

// ─── GET plan per package ─────────────────────────────────────

export const getPlanByPackagePlan = asyncHandler(async (req, res) => {
  const { packageplan } = req.params;

  const plan = await Plan.find({
    packageplan: packageplan?.trim(),
  }).lean();

  if (!plan) {
    return sendResponse(res, 404, false, "Plan not found");
  }

  return sendResponse(res, 200, true, "Plan retrieved successfully", plan);
});

// ─── UPDATE PLAN ─────────────────────────────────────────

export const updatePlan = asyncHandler(async (req, res) => {
  const { packageplan } = req.body;

  if (packageplan) {
    const conflict = await Plan.findOne({
      packageplan: packageplan.trim(),
      _id: { $ne: req.params.id },
    });

    if (conflict) {
      return sendResponse(
        res,
        409,
        false,
        `Another plan "${packageplan}" already exists`,
      );
    }
  }

  const updatedPlan = await Plan.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true },
  );

  if (!updatedPlan) {
    return sendResponse(res, 404, false, "Plan not found");
  }

  return sendResponse(res, 200, true, "Plan updated successfully", updatedPlan);
});

// ─── DELETE (SOFT DELETE) ────────────────────────────────

export const deletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!plan) {
    return sendResponse(res, 404, false, "Plan not found");
  }

  return sendResponse(res, 200, true, "Plan deactivated successfully", plan);
});

// ─── RESTORE PLAN ────────────────────────────────────────

export const restorePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true },
  );

  if (!plan) {
    return sendResponse(res, 404, false, "Plan not found");
  }

  return sendResponse(res, 200, true, "Plan restored successfully", plan);
});
