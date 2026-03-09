import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/User";
import PendingUser from "../models/PendingUser";
import generateToken from "../utils/generateToken";
import { sendOTPEmail } from "../utils/emailService";

// ── Helper: generate 6-digit OTP ──
const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ─────────────────────────────────────────
// @desc    Register ADMIN user & send OTP
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: "Please fill all fields" });
    return;
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({
      success: false,
      message: "User already exists with this email",
    });
    return;
  }

  const otp = generateOTP();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  const user = await User.create({
    name,
    email,
    password,
    role: "admin",
    isVerified: false,
    otp,
    otpExpire,
  });

  // Try sending email — don't crash if it fails
  try {
    await sendOTPEmail(email, name, otp, "verification");
  } catch (emailErr) {
    console.error("⚠️  OTP email failed (admin register):", emailErr);
    // Still return success — admin can manually verify
  }

  res.status(201).json({
    success: true,
    message:
      "Registration successful! Check your email for the OTP. (Check server logs if email not received)",
    email: user.email,
    // Return OTP in dev mode so you can test without email
    ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
  });
});

// ─────────────────────────────────────────
// @desc    Register CUSTOMER & send OTP (save to PendingUser, NOT User)
// @route   POST /api/auth/register-customer
// @access  Public
// ─────────────────────────────────────────
export const registerCustomer = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
      return;
    }

    // Check if pending user already exists - check this FIRST
    const pendingUserExists = await PendingUser.findOne({ email: email.toLowerCase().trim() });
    if (pendingUserExists) {
      // Check if OTP has expired - if so, allow new registration by deleting old pending
      if (pendingUserExists.otpExpire && pendingUserExists.otpExpire < new Date()) {
        // OTP expired, delete the stale pending user and allow new registration
        await PendingUser.deleteOne({ _id: pendingUserExists._id });
      } else {
        // OTP still valid - tell user to check email or request new OTP
        res.status(400).json({
          success: false,
          message: "A verification OTP has already been sent. Please check your email or request a new OTP.",
        });
        return;
      }
    }

    // Check if user already exists in User collection (verified users)
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      if (!userExists.isVerified) {
        // User exists but not verified - return success and tell frontend to redirect to verify
        res.status(200).json({
          success: true,
          message: "An unverified account exists. Please verify your email.",
          requiresVerification: true,
          email: userExists.email,
        });
        return;
      }
      // User is verified - don't allow re-registration
      res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
      return;
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    // Save to PendingUser (NOT User) - user is NOT created until OTP is verified
    const pendingUser = await PendingUser.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "customer",
      otp,
      otpExpire,
    });

    // Try email — never crash the registration
    let emailSent = false;
    try {
      await sendOTPEmail(email, name, otp, "verification");
      emailSent = true;
    } catch (emailErr) {
      console.error("⚠️  OTP email failed (customer register):", emailErr);
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? "Registration initiated! Please verify your email with the OTP sent."
        : "Registration initiated! Email sending failed — check server logs.",
      email: pendingUser.email,
      emailSent,
      // Show OTP in development so you can test without email setup
      ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
    });
  }
);

// ─────────────────────────────────────────
// @desc    Verify OTP - creates user in User collection after verification
// @route   POST /api/auth/verify-otp
// @access  Public
// ─────────────────────────────────────────
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // FIRST: Check PendingUser collection - this is for CUSTOMER registration
  const pendingUser = await PendingUser.findOne({
    email: normalizedEmail,
  }).select("+otp +otpExpire +password");

  if (pendingUser) {
    // PendingUser exists - this is a customer registration verification
    
    if (!pendingUser.otp || !pendingUser.otpExpire) {
      res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
      return;
    }

    if (pendingUser.otpExpire < new Date()) {
      res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
      return;
    }

    if (pendingUser.otp !== otp.toString().trim()) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
      });
      return;
    }

    // OTP verified! Now create the user in User collection
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
      isVerified: true,
    });

    // Delete the pending user
    await PendingUser.deleteOne({ _id: pendingUser._id });

    const token = generateToken(user._id as any);

    res.status(200).json({
      success: true,
      message: "Email verified successfully! Welcome to Urban Nile.",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
    return;
  }

  // SECOND: Check User collection - this is for ADMIN registration or already verified users
  const existingUser = await User.findOne({ email: normalizedEmail }).select("+otp +otpExpire");
  
  if (!existingUser) {
    res.status(404).json({ 
      success: false, 
      message: "No pending registration found. Please register first." 
    });
    return;
  }

  // User exists in User collection
  if (existingUser.isVerified) {
    // Already verified — just log them in
    const token = generateToken(existingUser._id as any);
    res.status(200).json({
      success: true,
      message: "Email already verified. Logging you in.",
      token,
      user: {
        _id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        isVerified: existingUser.isVerified,
      },
    });
    return;
  }

  // User exists but not verified (e.g., admin registration) - check OTP
  if (!existingUser.otp || !existingUser.otpExpire) {
    res.status(400).json({
      success: false,
      message: "No OTP found. Please request a new one.",
    });
    return;
  }

  if (existingUser.otpExpire < new Date()) {
    res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new one.",
    });
    return;
  }

  if (existingUser.otp !== otp.toString().trim()) {
    res.status(400).json({
      success: false,
      message: "Invalid OTP. Please check and try again.",
    });
    return;
  }

  // Mark as verified
  existingUser.isVerified = true;
  existingUser.otp = undefined;
  existingUser.otpExpire = undefined;
  await existingUser.save();

  const token = generateToken(existingUser._id as any);

  res.status(200).json({
    success: true,
    message: "Email verified successfully! Welcome to Urban Nile.",
    token,
    user: {
      _id: existingUser._id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
      isVerified: existingUser.isVerified,
    },
  });
});

// ─────────────────────────────────────────
// @desc    Resend OTP - handles both User and PendingUser
// @route   POST /api/auth/resend-otp
// @access  Public
// ─────────────────────────────────────────
export const resendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // First check if user exists in User collection (verified or unverified)
  const user = await User.findOne({ email: normalizedEmail });

  if (user) {
    // User exists - check if already verified
    if (user.isVerified) {
      res.status(400).json({ success: false, message: "Email already verified" });
      return;
    }

    // User exists but not verified - update OTP
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpire = otpExpire;
    await user.save();

    let emailSent = false;
    try {
      await sendOTPEmail(email, user.name, otp, "verification");
      emailSent = true;
    } catch (err) {
      console.error("⚠️  Resend OTP email failed:", err);
    }

    res.status(200).json({
      success: true,
      message: emailSent
        ? "New OTP sent to your email."
        : "OTP generated but email failed.",
      ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
    });
    return;
  }

  // Check PendingUser collection
  const pendingUser = await PendingUser.findOne({ email: normalizedEmail });

  if (!pendingUser) {
    res.status(404).json({ 
      success: false, 
      message: "No pending registration found. Please register first." 
    });
    return;
  }

  // Update OTP for pending user
  const otp = generateOTP();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  pendingUser.otp = otp;
  pendingUser.otpExpire = otpExpire;
  await pendingUser.save();

  let emailSent = false;
  try {
    await sendOTPEmail(email, pendingUser.name, otp, "verification");
    emailSent = true;
  } catch (err) {
    console.error("⚠️  Resend OTP email failed:", err);
  }

  res.status(200).json({
    success: true,
    message: emailSent
      ? "New OTP sent to your email."
      : "OTP generated but email failed.",
    ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
  });
});

// ─────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Please provide email and password",
    });
    return;
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");

  if (!user) {
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
    return;
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
    return;
  }

  // Block unverified — but tell frontend so it can redirect to OTP page
  if (!user.isVerified) {
    res.status(403).json({
      success: false,
      message: "Please verify your email before logging in.",
      requiresVerification: true,
      email: user.email,
    });
    return;
  }

  const token = generateToken(user._id as any);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

// ─────────────────────────────────────────
// @desc    Forgot password — send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
// ─────────────────────────────────────────
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Don't reveal if user exists
    if (!user) {
      res.status(200).json({
        success: true,
        message:
          "If an account with this email exists, you will receive an OTP.",
      });
      return;
    }

    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpire = otpExpire;
    await user.save();

    let emailSent = false;
    try {
      await sendOTPEmail(email, user.name, otp, "reset");
      emailSent = true;
    } catch (err) {
      console.error("⚠️  Forgot password email failed:", err);
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpire = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: emailSent
        ? "Password reset OTP sent to your email."
        : "Email sending failed. Please try again.",
      ...(process.env.NODE_ENV === "development" && emailSent && { devOtp: otp }),
    });
  }
);

// ─────────────────────────────────────────
// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
// ─────────────────────────────────────────
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ success: false, message: "All fields are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters",
      });
      return;
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+resetPasswordOtp +resetPasswordOtpExpire");

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpire) {
      res.status(400).json({
        success: false,
        message: "No reset OTP found. Please request a new one.",
      });
      return;
    }

    if (user.resetPasswordOtpExpire < new Date()) {
      res.status(400).json({ success: false, message: "Reset OTP has expired." });
      return;
    }

    if (user.resetPasswordOtp !== otp.toString().trim()) {
      res.status(400).json({ success: false, message: "Invalid OTP." });
      return;
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  }
);

// ─────────────────────────────────────────
// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    user: {
      _id: user?._id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      isVerified: user?.isVerified,
    },
  });
});