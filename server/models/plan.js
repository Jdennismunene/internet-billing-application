import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    packageplan: {
      type: String,
      required: [true, "Plan plan is required"],
      trim: true,
    },
    packagename: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
      unique: true,
    },
    packageduration: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true,
    },
    packagespeed: {
      type: String,
      required: [true, "Speed is required"],
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    dataLimit: {
      type: String,
      default: "Unlimited",
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 hour"],
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Plan", planSchema);
