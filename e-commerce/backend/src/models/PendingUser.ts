import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IPendingUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "customer";
  otp: string;
  otpExpire: Date;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const PendingUserSchema = new Schema<IPendingUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpire: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
PendingUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
PendingUserSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Auto-delete after 10 minutes (OTP expiry time)
PendingUserSchema.index({ otpExpire: 1 }, { expireAfterSeconds: 600 });

export default mongoose.model<IPendingUser>("PendingUser", PendingUserSchema);

