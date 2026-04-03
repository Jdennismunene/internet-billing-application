import mongoose from "mongoose";

const BillingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  amount: { type: Number, required: true },

  billingMonth: { type: String, required: true }, // e.g "2025-11"
  startDate: { type: Date, default: Date.now }, // billing cycle starts
  dueDate: { type: Date, required: true }, // payment deadline

  paymentMethod: {
    type: String,
    enum: ["mpesa", "cash", "bank", "paypal"],
    default: "mpesa",
  },

  status: {
    type: String,
    enum: ["unpaid", "paid", "overdue"],
    default: "unpaid",
  },

  generatedAt: { type: Date, default: Date.now },
});

const Billing = mongoose.model("Billing", BillingSchema);

export default Billing;
