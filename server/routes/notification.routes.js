import express from "express";
import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification,
  getUnreadCount,
} from "../controllers/notification.controller.js";

import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// All notification routes are admin-protected
router.use(protect, adminOnly);

// ─── COLLECTION ROUTES
// GET  /api/admin/notifications                → list all (paginated)
// POST /api/admin/notifications                → create one
router.route("/").get(getAllNotifications).post(createNotification); //tested

// ─── SPECIAL ACTIONS
// GET   /api/admin/notifications/unread-count  → badge count
// PATCH /api/admin/notifications/mark-all-read → mark all read
// POST  /api/admin/notifications/broadcast     → global broadcast
router.get("/unread-count", getUnreadCount); //tested
router.patch("/mark-all-read", markAllAsRead); //tested
router.post("/broadcast", broadcastNotification); //tested

// ─── SINGLE RESOURCE ROUTES
// GET    /api/admin/notifications/:id          → get one
// PATCH  /api/admin/notifications/:id/read     → mark one as read
// DELETE /api/admin/notifications/:id          → delete one
router.get("/:id", getNotificationById); //tested
router.patch("/:id/read", markAsRead); //tested
router.delete("/:id", deleteNotification); //tested

export default router;
