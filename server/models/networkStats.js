import mongoose from "mongoose";

// ─────────────────────────────────────────────
//  Sub-schema: Real-Time Monitoring Metrics
// ─────────────────────────────────────────────
const realTimeMetricsSchema = new mongoose.Schema(
  {
    currentDownloadSpeed: {
      type: Number,
      default: 0,
      min: [0, "Download speed cannot be negative"],
      comment: "Current download speed in Mbps",
    },
    currentUploadSpeed: {
      type: Number,
      default: 0,
      min: [0, "Upload speed cannot be negative"],
      comment: "Current upload speed in Mbps",
    },
    currentPing: {
      type: Number,
      default: 0,
      min: [0, "Ping cannot be negative"],
      comment: "Current ping/latency in milliseconds",
    },
  },
  { _id: false },
);

// ─────────────────────────────────────────────
//  Sub-schema: Daily Performance Averages
// ─────────────────────────────────────────────
const dailyPerformanceSchema = new mongoose.Schema(
  {
    avgDailyDownloadSpeed: {
      type: Number,
      default: 0,
      min: [0, "Average download speed cannot be negative"],
      comment: "Average daily download speed in Mbps",
    },
    avgDailyUploadSpeed: {
      type: Number,
      default: 0,
      min: [0, "Average upload speed cannot be negative"],
      comment: "Average daily upload speed in Mbps",
    },
    avgDailyPing: {
      type: Number,
      default: 0,
      min: [0, "Average ping cannot be negative"],
      comment: "Average daily ping/latency in milliseconds",
    },
  },
  { _id: false },
);

// ─────────────────────────────────────────────
//  Sub-schema: Data Usage Tracking
// ─────────────────────────────────────────────
const dataUsageSchema = new mongoose.Schema(
  {
    totalDataDownloaded: {
      type: Number,
      default: 0,
      min: [0, "Total downloaded data cannot be negative"],
      comment: "Total data downloaded in MB",
    },
    totalDataUploaded: {
      type: Number,
      default: 0,
      min: [0, "Total uploaded data cannot be negative"],
      comment: "Total data uploaded in MB",
    },
  },
  { _id: false },
);

// ─────────────────────────────────────────────
//  Main Schema: Network Statistics
// ─────────────────────────────────────────────
const networkStatsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },

    realTimeMetrics: {
      type: realTimeMetricsSchema,
      default: () => ({}),
    },

    dailyPerformance: {
      type: dailyPerformanceSchema,
      default: () => ({}),
    },

    dataUsage: {
      type: dataUsageSchema,
      default: () => ({}),
    },

    recordDate: {
      type: Date,
      default: () => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return today;
      },
      index: true,
    },

    networkQualityScore: {
      type: Number,
      default: null,
      min: [0, "Quality score cannot be negative"],
      max: [100, "Quality score cannot exceed 100"],
    },

    connectionStatus: {
      type: String,
      enum: ["online", "offline", "degraded", "unknown"],
      default: "unknown",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "network_stats",
  },
);

// Indexes
networkStatsSchema.index({ user: 1, recordDate: 1 }, { unique: true });
networkStatsSchema.index({ user: 1, createdAt: -1 });

// Virtuals
networkStatsSchema.virtual("totalDataUsageMB").get(function () {
  return (
    (this.dataUsage?.totalDataDownloaded ?? 0) +
    (this.dataUsage?.totalDataUploaded ?? 0)
  );
});

networkStatsSchema.virtual("totalDataUsageGB").get(function () {
  return parseFloat((this.totalDataUsageMB / 1024).toFixed(3));
});

// Pre-save hook
networkStatsSchema.pre("save", function (next) {
  try {
    const { avgDailyDownloadSpeed, avgDailyUploadSpeed, avgDailyPing } =
      this.dailyPerformance || {};

    const hasMetrics =
      avgDailyDownloadSpeed != null ||
      avgDailyUploadSpeed != null ||
      avgDailyPing != null;

    if (hasMetrics) {
      const SPEED_CEILING = 100;

      const downloadScore =
        Math.min((avgDailyDownloadSpeed ?? 0) / SPEED_CEILING, 1) * 50;

      const uploadScore =
        Math.min((avgDailyUploadSpeed ?? 0) / SPEED_CEILING, 1) * 30;

      const PING_CEILING = 200;

      const pingScore =
        Math.max(0, 1 - (avgDailyPing ?? 0) / PING_CEILING) * 20;

      this.networkQualityScore = parseFloat(
        (downloadScore + uploadScore + pingScore).toFixed(2),
      );
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Static methods
networkStatsSchema.statics.upsertTodayRecord = async function (
  userId,
  updateData,
) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return this.findOneAndUpdate(
    { user: userId, recordDate: today },
    { $set: updateData },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
};

networkStatsSchema.statics.getStatsByDateRange = async function (
  userId,
  startDate,
  endDate,
) {
  return this.find({
    user: userId,
    recordDate: { $gte: startDate, $lte: endDate },
  }).sort({ recordDate: 1 });
};

networkStatsSchema.statics.getMonthlySummary = async function (
  userId,
  year,
  month,
) {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const [result] = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        recordDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        totalDownloaded: { $sum: "$dataUsage.totalDataDownloaded" },
        totalUploaded: { $sum: "$dataUsage.totalDataUploaded" },
        avgDownloadSpeed: { $avg: "$dailyPerformance.avgDailyDownloadSpeed" },
        avgUploadSpeed: { $avg: "$dailyPerformance.avgDailyUploadSpeed" },
        avgPing: { $avg: "$dailyPerformance.avgDailyPing" },
        avgQualityScore: { $avg: "$networkQualityScore" },
        recordCount: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        totalDownloadedMB: { $round: ["$totalDownloaded", 2] },
        totalUploadedMB: { $round: ["$totalUploaded", 2] },
        totalUsageMB: {
          $round: [{ $add: ["$totalDownloaded", "$totalUploaded"] }, 2],
        },
        avgDownloadSpeed: { $round: ["$avgDownloadSpeed", 2] },
        avgUploadSpeed: { $round: ["$avgUploadSpeed", 2] },
        avgPing: { $round: ["$avgPing", 2] },
        avgQualityScore: { $round: ["$avgQualityScore", 2] },
        recordCount: 1,
      },
    },
  ]);

  return result ?? null;
};

// Export
const NetworkStats = mongoose.model("NetworkStats", networkStatsSchema);

export default NetworkStats;
