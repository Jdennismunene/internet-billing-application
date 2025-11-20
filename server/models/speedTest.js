import mongoose from "mongoose";

const SpeedTestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  downloadSpeed: { type: Number, required: true }, // in Mbps
  uploadSpeed: { type: Number, required: true }, // in Mbps
  ping: { type: Number, required: true }, // in ms
  jitter: { type: Number }, // optional
  packetLoss: { type: Number }, // percentage

  serverLocation: { type: String, default: "Nairobi" },
  deviceType: { type: String }, // mobile / pc / router test

  testedAt: { type: Date, default: Date.now },
});
const SpeedTest = mongoose.model("SpeedTest", SpeedTestSchema);
export default SpeedTest;
