import mongoose from "mongoose";

const NetworkStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // real-time monitoring
  currentDownloadSpeed: {
    type: Number,
    default: 0, // Mbps
    required: true,
  },
  currentUploadSpeed: {
    type: Number,
    default: 0, // Mbps
    required: true,
  },
  currentPing: {
    type: Number,
    default: 0, // ms
    required: true,
  },

  // daily totals or averages
  avgDailyDownloadSpeed: {
    type: Number,
    default: 0, // Mbps
    required: true,
  },
  avgDailyUploadSpeed: {
    type: Number,
    default: 0, // Mbps
    required: true,
  },
  avgDailyPing: {
    type: Number,
    default: 0, // ms
    required: true,
  },

  totalDataDownloaded: {
    type: Number,
    default: 0, // in MB or GB
  },
  totalDataUploaded: {
    type: Number,
    default: 0, // in MB or GB
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const NetworkStats = mongoose.model("NetworkStats", NetworkStatsSchema);
export default NetworkStats;
