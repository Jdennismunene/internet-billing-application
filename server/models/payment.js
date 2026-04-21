import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentCode: { type: String, required: true, unique: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paymentMethod: {
      type: String,
      enum: ["mpesa", "bank", "card", "cash", "other"],
      default: "other",
    },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    package: { type: mongoose.Schema.Types.ObjectId, ref: "Package" },
    transactionRef: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
