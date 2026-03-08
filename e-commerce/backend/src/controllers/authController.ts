import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import User from "../models/User";
import generateToken from "../utils/generateToken";
import { sendOTPEmail } from "../utils/emailService";

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register admin user & send OTP
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: "Please fill all fields" });
    return;
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({ success: false, message: "User already exists with this email" });
    return;
  }

  // Auto-verify users for development (skip email verification)
  const user = await User.create({
    name,
    email,
    password,
    role: "admin",
    isVerified: true, // Auto-verify for development
  });

  const token = generateToken(user._id as any);

  res.status(201).json({
    success: true,
    message: "Registration successful! Welcome to Urban Nile.",
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

// @desc    Verify OTP for email verification
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ success: false, message: "Email and OTP are required" });
    return;
  }

  const user = await User.findOne({ email }).select("+otp +otpExpire");

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  if (user.isVerified) {
    res.status(400).json({ success: false, message: "Email already verified" });
    return;
  }

  if (!user.otp || !user.otpExpire) {
    res.status(400).json({ success: false, message: "No OTP found. Please request a new one." });
    return;
  }

  if (user.otpExpire < new Date()) {
    res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    return;
  }

  if (user.otp !== otp) {
    res.status(400).json({ success: false, message: "Invalid OTP. Please check and try again." });
    return;
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

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
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  if (user.isVerified) {
    res.status(400).json({ success: false, message: "Email already verified" });
    return;
  }

  const otp = generateOTP();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  user.otp = otp;
  user.otpExpire = otpExpire;
  await user.save();

  try {
    await sendOTPEmail(email, user.name, otp, "verification");
    res.status(200).json({
      success: true,
      message: "New OTP sent to your email address.",
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP email. Please try again.",
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: "Please provide email and password" });
    return;
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }

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

// @desc    Forgot password - send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return;
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(200).json({
      success: true,
      message: "If an account exists with this email, you will receive an OTP.",
    });
    return;
  }

  const otp = generateOTP();
  const otpExpire = new Date(Date.now() + 10 * 60 * 1000);

  user.resetPasswordOtp = otp;
  user.resetPasswordOtpExpire = otpExpire;
  await user.save();

  try {
    await sendOTPEmail(email, user.name, otp, "reset");
    res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email.",
    });
  } catch {
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;
    await user.save();
    res.status(500).json({
      success: false,
      message: "Failed to send OTP email. Please try again.",
    });
  }
});

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    res.status(400).json({ success: false, message: "All fields are required" });
    return;
  }

  const user = await User.findOne({ email }).select("+resetPasswordOtp +resetPasswordOtpExpire");

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  if (!user.resetPasswordOtp || !user.resetPasswordOtpExpire) {
    res.status(400).json({ success: false, message: "No reset OTP found. Please request a new one." });
    return;
  }

  if (user.resetPasswordOtpExpire < new Date()) {
    res.status(400).json({ success: false, message: "Reset OTP has expired." });
    return;
  }

  if (user.resetPasswordOtp !== otp) {
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
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
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