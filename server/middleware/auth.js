import jwt from "jsonwebtoken";
import UserSchema from "../models/user.js";

//Helpers

const sendUnauthorized = (res, message = "Not authorized") =>
  res.status(401).json({ success: false, message });

const sendForbidden = (res, message = "Access denied") =>
  res.status(403).json({ success: false, message });

// protect

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendUnauthorized(res, "No token provided. Please log in.");
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return sendUnauthorized(res, "Session expired. Please log in again.");
      }
      return sendUnauthorized(res, "Invalid token. Please log in.");
    }

    // Fetch fresh user from DB (ensures deactivated accounts are blocked)
    const user = await UserSchema.findById(decoded.id).select("-password");

    if (!user) {
      return sendUnauthorized(res, "User no longer exists.");
    }

    if (user.status !== "active") {
      return sendUnauthorized(res, "Your account has been deactivated.");
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Authentication error" });
  }
};

//adminOnly

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res, "Not authenticated.");
  }

  if (req.user.role !== "admin") {
    return sendForbidden(res, "Admin access required.");
  }

  next();
};

//  authorizeRoles

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, "Not authenticated.");
    }

    if (!roles.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Role "${req.user.role}" is not permitted to access this resource.`,
      );
    }

    next();
  };
};
