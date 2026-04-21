import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["feature", "alert", "payment", "system", "general"],
      default: "general",
    },
    icon: { type: String, default: "notification" },
    isRead: { type: Boolean, default: false },
    isGlobal: { type: Boolean, default: false },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    link: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
