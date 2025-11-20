import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  reportType: {
    type: String,
    enum: ["bug", "feedback", "usage", "other"],
    default: "other",
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "resolved"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
});

const Report = mongoose.model("Report", ReportSchema);
export default Report;
