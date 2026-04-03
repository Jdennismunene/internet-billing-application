import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Billing",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true,
  },
  amountPaid: {
    type: Number,
    required: true,
  },
  totalRevenue: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["mpesa", "card", "cash"],
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
    enum: ["success", "failed", "pending"],
    default: "success",
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;
