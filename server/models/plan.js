import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Plan name is required"], // e.g., "Home Basic"
  },
  speed: {
    type: String,
    required: [true, "Speed is required"], // e.g., "10Mbps"
  },
  price: {
    type: Number,
    required: [true, "Price is required"], // monthly price
  },
  dataLimit: {
    type: String, // optional, e.g., "100GB"
  },
  description: {
    type: String, // optional
  },
  duration: {
    type: Number,
    required: [true, "Duration is required"], // duration in months
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Plan = mongoose.model("Plan", PlanSchema);
export default Plan;
