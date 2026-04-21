import mongoose from "mongoose";

const billingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: [true, "Plan reference is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    billingMonth: {
      type: String,
      required: [true, "Billing month is required"],
      match: [
        /^\d{4}-(0[1-9]|1[0-2])$/,
        "Billing month must be in YYYY-MM format",
      ],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ["mpesa", "cash", "bank", "paypal"],
        message: "{VALUE} is not a supported payment method",
      },
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["unpaid", "paid", "overdue"],
        message: "{VALUE} is not a valid status",
      },
      default: "unpaid",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Compound index to prevent duplicate billing for same user/plan/month
billingSchema.index({ user: 1, plan: 1, billingMonth: 1 }, { unique: true });

// Auto-mark as overdue if past due date
billingSchema.pre("save", function (next) {
  if (this.status === "unpaid" && this.dueDate < new Date()) {
    this.status = "overdue";
  }
  next();
});

export default mongoose.model("Billing", billingSchema);
