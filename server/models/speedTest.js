import mongoose from "mongoose";

const SpeedTestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Results
    downloadSpeed: { type: Number, default: 0 }, // Mbps
    uploadSpeed: { type: Number, default: 0 }, // Mbps
    ping: { type: Number, default: 0 }, // ms
    jitter: { type: Number, default: 0 },
    packetLoss: { type: Number, default: 0 },

    // Metadata
    serverLocation: { type: String, default: "Nairobi" },
    deviceType: { type: String, default: "unknown" },

    // Test lifecycle (important for progress system)
    status: {
      type: String,
      enum: ["pending", "running", "completed", "failed"],
      default: "pending",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Extra (optional but useful)
    ipAddress: { type: String },
    isp: { type: String },

    testedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const SpeedTest = mongoose.model("SpeedTest", SpeedTestSchema);
export default SpeedTest;
