import Notification from "../models/notification.js";

// ─── GET ALL NOTIFICATIONS (Admin view) ──────────────────────────────────────
/**
 * GET /api/admin/notifications
 * Query: isRead, type, page, limit
 */
export const getAllNotifications = async (req, res) => {
  try {
    const { isRead, type, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (isRead !== undefined && isRead !== "All") {
      if (["true", "false"].includes(isRead)) {
        filter.isRead = isRead === "true";
      }
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate("createdBy", "username")
        .populate("targetUser", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),

      Notification.countDocuments(filter),

      Notification.countDocuments({ isRead: false }),
    ]);

    return res.status(200).json({
      success: true,
      unreadCount,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET SINGLE NOTIFICATION ─────────────────────────────────────────────────
/**
 * GET /api/admin/notifications/:id
 */
export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate("createdBy", "username")
      .populate("targetUser", "username email")
      .lean();

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── CREATE NOTIFICATION ─────────────────────────────────────────────────────
/**
 * POST /api/admin/notifications
 * Body: { title, message, type, isGlobal, targetUser, link, icon }
 */
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, isGlobal, targetUser, link, icon } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || "general",
      isGlobal: isGlobal || false,
      targetUser: isGlobal ? null : targetUser,
      link,
      icon,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Notification created",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── MARK NOTIFICATION AS READ ───────────────────────────────────────────────
/**
 * PATCH /api/admin/notifications/:id/read
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    ).lean();

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Marked as read",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── MARK ALL AS READ ────────────────────────────────────────────────────────
/**
 * PATCH /api/admin/notifications/mark-all-read
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── DELETE NOTIFICATION ─────────────────────────────────────────────────────
/**
 * DELETE /api/admin/notifications/:id
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(
      req.params.id,
    ).lean();

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── BROADCAST NOTIFICATION ──────────────────────────────────────────────────
/**
 * POST /api/admin/notifications/broadcast
 */
export const broadcastNotification = async (req, res) => {
  try {
    const { title, message, type, link } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const notification = await Notification.create({
      title,
      message,
      type: type || "general",
      isGlobal: true,
      targetUser: null,
      link,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Broadcast notification sent to all users",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET UNREAD COUNT ────────────────────────────────────────────────────────
/**
 * GET /api/admin/notifications/unread-count
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });

    return res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
