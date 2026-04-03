import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  email: { type: String, unique: true },
  address: { type: String },

  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },

  location: { type: String },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  status: { type: String, enum: ["active", "inactive"], default: "active" },

  createdAt: { type: Date, default: Date.now },
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,
});
const User = mongoose.model("User", UserSchema);
export default User;
