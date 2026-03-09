import express from "express";
import {
  register,
  registerCustomer,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register",           register);           // admin register
router.post("/register-customer",  registerCustomer);   // customer register
router.post("/login",              login);
router.post("/verify-otp",         verifyOTP);
router.post("/resend-otp",         resendOTP);
router.post("/forgot-password",    forgotPassword);
router.post("/reset-password",     resetPassword);
router.get("/me",                  protect, getMe);

export default router;