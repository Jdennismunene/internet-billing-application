import Plan from "../models/Plan.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const sendResponse = (res, statusCode, success, message, data = null) => {
  const payload = { success, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
};

// ─── Controllers ────────────────────────────────────────────────────────────

/**
 * @desc    Create a new internet plan
 * @route   POST /api/plans
 * @access  Private (Admin)
 */
export const createPlan = asyncHandler(async (req, res) => {
  const { name, speed, price, dataLimit, description, duration } = req.body;

  const existingPlan = await Plan.findOne({ name: name?.trim() });
  if (existingPlan) {
    return sendResponse(
      res,
      409,
      false,
      `A plan named "${name}" already exists`,
    );
  }

  const plan = await Plan.create({
    name,
    speed,
    price,
    dataLimit,
    description,
    duration,
  });

  return sendResponse(res, 201, true, "Plan created successfully", plan);
});

/**
 * @desc    Get all plans (optionally filter active only)
 * @route   GET /api/plans
 * @access  Public
 */
export const getAllPlans = asyncHandler(async (req, res) => {
  const { active, minPrice, maxPrice, sort = "price" } = req.query;

  const filter = {};
  if (active !== undefined) filter.isActive = active === "true";
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const allowedSorts = [
    "price",
    "-price",
    "name",
    "-name",
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

/**
 * @desc    Get a single plan by ID
 * @route   GET /api/plans/:id
 * @access  Public
 */
export const getPlanById = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id).lean();

  if (!plan) {
    return sendResponse(res, 404, false, "Plan not found");
  }

  return sendResponse(res, 200, true, "Plan retrieved successfully", plan);
});

/**
 * @desc    Update a plan
 * @route   PUT /api/plans/:id
 * @access  Private (Admin)
 */
export const updatePlan = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Check name uniqueness if being changed
  if (name) {
    const conflict = await Plan.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id },
    });
    if (conflict) {
      return sendResponse(
        res,
        409,
        false,
        `Another plan named "${name}" already exists`,
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

/**
 * @desc    Soft-delete (deactivate) a plan
 * @route   DELETE /api/plans/:id
 * @access  Private (Admin)
 */
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

/**
 * @desc    Restore (reactivate) a deactivated plan
 * @route   PATCH /api/plans/:id/restore
 * @access  Private (Admin)
 */
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
