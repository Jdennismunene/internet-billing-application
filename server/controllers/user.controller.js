import User from "../models/user.js";
import Billing from "../models/billing.js";
import SpeedTest from "../models/speedTest.js";
// get profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // comes from auth middleware (JWT)

    const user = await User.findById(userId).select(
      "username email phone location",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      profile: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Update profile for the user
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id; // from verifyToken middleware
    const allowedUpdates = [
      "username",
      "email",
      "phone",
      "location",
      "gender",
      "address",
    ];

    // Build updates object only with allowed fields
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true, // return updated document
      runValidators: true, // run mongoose validators
    }).select("-password"); // exclude password

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//user billing
export const getUserBilling = async (req, res) => {
  try {
    const userId = req.user._id;

    const bills = await Billing.find({ user: userId })
      .populate("plan", "name speed price") // show plan details
      .sort({ generatedAt: -1 }); // latest first

    if (!bills || bills.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No billing records found",
      });
    }

    res.status(200).json({
      success: true,
      bills,
    });
  } catch (error) {
    console.error("Get billing error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ------------------------
//test it
// View User Speed Tests
// ------------------------
export const getUserSpeedTests = async (req, res) => {
  try {
    const userId = req.user._id;

    const tests = await SpeedTest.find({ user: userId }).sort({ testedAt: -1 }); // latest first

    if (!tests || tests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No speed tests found",
      });
    }

    res.status(200).json({
      success: true,
      speedTests: tests,
    });
  } catch (error) {
    console.error("Get speed tests error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error check your net",
    });
  }
};
