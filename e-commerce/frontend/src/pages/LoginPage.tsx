import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail, Lock, User, AlertCircle, ArrowRight,
} from "lucide-react";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

type Mode = "login" | "register" | "verify" | "forgot" | "reset";

const LoginPage: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/my-orders";

  const [mode,         setMode]         = useState<Mode>("login");
  const [loading,      setLoading]      = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [error,        setError]        = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "", otp: "", newPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  // ── Login ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill all fields"); return; }
    setLoading(true);
    try {
      const res = await authService.login({ email: form.email, password: form.password });

      if (res.requiresVerification) {
        setPendingEmail(form.email);
        setMode("verify");
        toast.error("Please verify your email first.");
        return;
      }
      if (res.token && res.user) {
        login(res.token, res.user);
        toast.success(`Welcome back, ${res.user.name}! 👋`);
        // Admin → admin dashboard, customer → my-orders
        navigate(res.user.role === "admin" ? "/admin" : from, { replace: true });
      }
    } catch (err: unknown) {
      const axiosError = err as any;
      let message = "Invalid email or password";
      
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data;
        message = data.message || message;
        
        // requiresVerification OR OTP pending → verify mode
        if ((data.requiresVerification || status === 400) && 
            (data.requiresVerification || message.includes("verify") || message.includes("OTP"))) {
          setPendingEmail(form.email);
          setMode("verify");
          toast.error("Please verify your email first.");
          setLoading(false);
          return;
        }
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Register (customer) ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.registerCustomer({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      // If user exists but not verified, redirect to verify page
      if (res.requiresVerification) {
        setPendingEmail(res.email || form.email);
        setMode("verify");
        toast.error("Please verify your email first.");
        return;
      }

      setPendingEmail(form.email);
      setMode("verify");

      toast.success("Account created! Check your email for the OTP 📧");
    } catch (err: unknown) {
      const axiosError = err as any;
      let msg = "Registration failed";
      
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data;
        msg = data.message || msg;
        
        // Handle business logic 400s → treat as pending verification
        if (status === 400 && 
            (msg.includes("OTP") || 
             msg.includes("verification") || 
             msg.includes("pending"))) {
          setPendingEmail(form.email);
          setMode("verify");
          toast.error("Verification needed. Enter your OTP below.");
          setLoading(false);
          return;
        }
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.otp) { setError("Please enter the OTP"); return; }
    setLoading(true);
    try {
      const res = await authService.verifyOTP({
        email: pendingEmail,
        otp: form.otp,
      });
      if (res.token && res.user) {
        login(res.token, res.user);
        toast.success("Email verified! Welcome to Urban Nile! 🎉");
        navigate(res.user.role === "admin" ? "/admin" : from, { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })
              ?.response?.data?.message ?? "Invalid OTP or verification failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot Password ──
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) { setError("Email is required"); return; }
    setLoading(true);
    try {
      await authService.forgotPassword(form.email);
      setPendingEmail(form.email);
      setMode("reset");
      toast.success("Reset OTP sent to your email.");
    } catch {
      setError("Failed to send reset OTP.");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset Password ──
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.otp || !form.newPassword) { setError("All fields required"); return; }
    setLoading(true);
    try {
      await authService.resetPassword({
        email: pendingEmail, otp: form.otp, newPassword: form.newPassword,
      });
      toast.success("Password reset! Please login.");
      setMode("login");
      setForm((p) => ({ ...p, otp: "", newPassword: "" }));
    } catch {
      setError("Invalid OTP or something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border-2 border-gray-200 pl-10 pr-4 py-3 text-sm text-dark-400 " +
    "focus:outline-none focus:border-dark-400 transition-colors placeholder-gray-400";

  const titles: Record<Mode, { title: string; sub: string }> = {
    login:    { title: "Welcome Back",      sub: "Sign in to your Urban Nile account"       },
    register: { title: "Create Account",    sub: "Join the Urban Nile community"             },
    verify:   { title: "Verify Your Email", sub: `OTP sent to ${pendingEmail}`               },
    forgot:   { title: "Forgot Password",   sub: "We'll send you a reset OTP"                },
    reset:    { title: "Reset Password",    sub: `Enter OTP sent to ${pendingEmail}`         },
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-dark-400 tracking-[0.3em]">URBAN</h1>
            <p className="text-primary-500 tracking-[0.6em] text-sm -mt-1">NILE</p>
          </Link>
          <div className="w-8 h-0.5 bg-primary-500 mx-auto mt-3" />
        </div>

        <div className="bg-white shadow-lg border border-gray-100">
          {/* Card Header */}
          <div className="bg-dark-400 px-8 py-5">
            <h2 className="text-white font-bold text-lg tracking-wider">
              {titles[mode].title}
            </h2>
            <p className="text-gray-400 text-xs mt-1">{titles[mode].sub}</p>
          </div>

          <div className="p-8">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 mb-6">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* ── LOGIN ── */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="email" type="email" value={form.email}
                      onChange={handleChange} placeholder="you@example.com"
                      className={inputCls} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs font-bold text-dark-400 tracking-widest uppercase">
                      Password
                    </label>
                    <button type="button"
                      onClick={() => { setMode("forgot"); setError(""); }}
                      className="text-xs text-primary-500 hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="password" type="password"
                      value={form.password} onChange={handleChange}
                      placeholder="••••••••" className={inputCls} />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors flex items-center justify-center gap-3 disabled:opacity-60 group">
                  {loading ? <LoadingSpinner size="sm" /> : (
                    <> Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /> </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Don't have an account?{" "}
                  <button type="button"
                    onClick={() => { setMode("register"); setError(""); }}
                    className="text-primary-500 font-bold hover:underline">
                    Sign Up
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER ── */}
            {mode === "register" && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="name" type="text" value={form.name}
                      onChange={handleChange} placeholder="Ahmed Hassan"
                      className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="email" type="email" value={form.email}
                      onChange={handleChange} placeholder="you@example.com"
                      className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="password" type="password"
                      value={form.password} onChange={handleChange}
                      placeholder="Min. 8 characters" className={inputCls} />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors flex items-center justify-center gap-3 disabled:opacity-60 group">
                  {loading ? <LoadingSpinner size="sm" /> : (
                    <> Create Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /> </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Already have an account?{" "}
                  <button type="button"
                    onClick={() => { setMode("login"); setError(""); }}
                    className="text-primary-500 font-bold hover:underline">
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {/* ── VERIFY OTP ── */}
            {mode === "verify" && (
              <form onSubmit={handleVerify} className="space-y-5">
                <div className="bg-primary-500/10 border border-primary-500/30 p-4">
                  <p className="text-xs text-primary-700 leading-relaxed">
                    📬 We sent a <strong>6-digit OTP</strong> to{" "}
                    <strong>{pendingEmail}</strong>. Expires in 10 mins.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    Enter OTP Code
                  </label>
                  <input name="otp" type="text" value={form.otp}
                    onChange={handleChange} maxLength={6}
                    placeholder="• • • • • •"
                    className="w-full border-2 border-gray-200 px-4 py-4 text-center text-3xl font-bold tracking-[0.6em] text-dark-400 focus:outline-none focus:border-dark-400 transition-colors" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors flex items-center justify-center gap-3 disabled:opacity-60 group">
                  {loading ? <LoadingSpinner size="sm" /> : (
                    <> Verify Email <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /> </>
                  )}
                </button>
                <div className="text-center">
                  <button type="button"
                    onClick={async () => {
                      await authService.resendOTP(pendingEmail);
                      toast.success("New OTP sent!");
                    }}
                    className="text-xs text-primary-500 hover:underline font-semibold">
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {mode === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 p-4">
                  <p className="text-xs text-blue-700 leading-relaxed">
                    Enter your email and we'll send a reset OTP.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="email" type="email" value={form.email}
                      onChange={handleChange} placeholder="you@example.com"
                      className={inputCls} />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors flex items-center justify-center gap-3 disabled:opacity-60">
                  {loading ? <LoadingSpinner size="sm" /> : "Send Reset OTP"}
                </button>
                <p className="text-center text-sm text-gray-500">
                  <button type="button" onClick={() => { setMode("login"); setError(""); }}
                    className="text-primary-500 font-bold hover:underline">
                    ← Back to Login
                  </button>
                </p>
              </form>
            )}

            {/* ── RESET PASSWORD ── */}
            {mode === "reset" && (
              <form onSubmit={handleReset} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    OTP Code
                  </label>
                  <input name="otp" type="text" value={form.otp}
                    onChange={handleChange} maxLength={6}
                    placeholder="• • • • • •"
                    className="w-full border-2 border-gray-200 px-4 py-4 text-center text-3xl font-bold tracking-[0.6em] focus:outline-none focus:border-dark-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input name="newPassword" type="password"
                      value={form.newPassword} onChange={handleChange}
                      placeholder="Min. 8 characters" className={inputCls} />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors flex items-center justify-center gap-3 disabled:opacity-60">
                  {loading ? <LoadingSpinner size="sm" /> : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          By signing up you agree to our{" "}
          <a href="#" className="underline hover:text-dark-400">Terms</a> &{" "}
          <a href="#" className="underline hover:text-dark-400">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;