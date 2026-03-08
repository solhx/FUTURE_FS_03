import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { authService } from "../../services/authService";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

type AuthMode = "login" | "register" | "verify" | "forgot" | "reset";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/admin";

  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
    newPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login({
        email: form.email,
        password: form.password,
      });
      if (res.requiresVerification) {
        setPendingEmail(form.email);
        setMode("verify");
        toast.error("Please verify your email first.");
        return;
      }
      if (res.token && res.user) {
        authService.storeAuth(res.token, res.user);
        toast.success(`Welcome back, ${res.user.name}!`);
        navigate(from, { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

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
      const res = await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      // If token is returned, user is auto-verified (development mode)
      if (res.token && res.user) {
        authService.storeAuth(res.token, res.user);
        toast.success(`Welcome, ${res.user.name}!`);
        navigate(from, { replace: true });
      } else {
        // Fallback: OTP verification required (production mode)
        setPendingEmail(form.email);
        setMode("verify");
        toast.success("OTP sent! Check your email.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.otp) {
      setError("Please enter the OTP");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyOTP({
        email: pendingEmail,
        otp: form.otp,
      });
      if (res.token && res.user) {
        authService.storeAuth(res.token, res.user);
        toast.success("Email verified! Welcome to Urban Nile.");
        navigate(from, { replace: true });
      }
    } catch {
      setError("Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await authService.resendOTP(pendingEmail);
      toast.success("New OTP sent to your email.");
    } catch {
      toast.error("Failed to resend OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email) {
      setError("Email is required");
      return;
    }
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.otp || !form.newPassword) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({
        email: pendingEmail,
        otp: form.otp,
        newPassword: form.newPassword,
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

  const modeConfig = {
    login: { title: "Admin Login", sub: "Sign in to Urban Nile Dashboard" },
    register: { title: "Create Admin", sub: "Register a new admin account" },
    verify: { title: "Verify Email", sub: `OTP sent to ${pendingEmail}` },
    forgot: { title: "Forgot Password", sub: "Enter your email to receive a reset OTP" },
    reset: { title: "Reset Password", sub: `Enter OTP sent to ${pendingEmail}` },
  };

  return (
    <div className="min-h-screen bg-dark-400 flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute border border-white/5 rounded-full"
            style={{
              width: `${(i + 1) * 200}px`,
              height: `${(i + 1) * 200}px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-[0.3em]">URBAN</h1>
          <p className="text-primary-500 tracking-[0.6em] text-sm -mt-1">NILE</p>
          <div className="w-8 h-0.5 bg-primary-500 mx-auto mt-3" />
        </div>

        {/* Card */}
        <div className="bg-white shadow-2xl">
          <div className="bg-dark-300 px-8 py-5 border-b border-white/10">
            <h2 className="text-white font-bold text-lg tracking-wider">
              {modeConfig[mode].title}
            </h2>
            <p className="text-gray-400 text-xs mt-1">{modeConfig[mode].sub}</p>
          </div>

          <div className="p-8">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 mb-6 rounded-none">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* ── Login Form ── */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="admin@urbannile.com"
                      className="w-full border-2 border-gray-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-dark-400 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      name="password"
                      type={showPass ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full border-2 border-gray-200 pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-dark-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-400"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setError(""); }}
                    className="text-xs text-primary-500 hover:text-primary-700 underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-60 group"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500">
                  Need an admin account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("register"); setError(""); }}
                    className="text-primary-500 font-semibold hover:underline"
                  >
                    Register
                  </button>
                </p>
              </form>
            )}

                           {/* ── Register Form ── */}
                {mode === "register" && (
                  <form onSubmit={handleRegister} className="space-y-5">
                    {[
                      {
                        name: "name",
                        label: "Full Name",
                        type: "text",
                        placeholder: "Urban Nile Admin",
                        icon: <Mail size={15} />,
                      },
                      {
                        name: "email",
                        label: "Email Address",
                        type: "email",
                        placeholder: "admin@urbannile.com",
                        icon: <Mail size={15} />,
                      },
                    ].map((field) => (
                      <div key={field.name}>
                        <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                          {field.label}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {field.icon}
                          </span>
                          <input
                            name={field.name}
                            type={field.type}
                            value={form[field.name as keyof typeof form]}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            className="w-full border-2 border-gray-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-dark-400 transition-colors"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          name="password"
                          type={showPass ? "text" : "password"}
                          value={form.password}
                          onChange={handleChange}
                          placeholder="Min. 8 characters"
                          className="w-full border-2 border-gray-200 pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-dark-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-400"
                        >
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Must be at least 8 characters
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-60 group"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setError("");
                        }}
                        className="text-primary-500 font-semibold hover:underline"
                      >
                        Sign In
                      </button>
                    </p>
                  </form>
                )}

                {/* ── Verify OTP Form ── */}
                {mode === "verify" && (
                  <form onSubmit={handleVerifyOTP} className="space-y-5">
                    <div className="bg-primary-500/10 border border-primary-500/30 rounded-none p-4 text-sm text-primary-700 mb-2">
                      <p className="font-semibold mb-1">Check your inbox 📬</p>
                      <p className="text-xs text-primary-600 leading-relaxed">
                        We sent a 6-digit verification code to{" "}
                        <strong>{pendingEmail}</strong>. It expires in 10
                        minutes.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                        Enter OTP Code
                      </label>
                      <input
                        name="otp"
                        type="text"
                        value={form.otp}
                        onChange={handleChange}
                        maxLength={6}
                        placeholder="• • • • • •"
                        className="w-full border-2 border-gray-200 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-dark-400 focus:outline-none focus:border-dark-400 transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-60 group"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          Verify Email
                          <ArrowRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </button>

                    <div className="text-center space-y-2">
                      <p className="text-xs text-gray-500">
                        Didn't receive the code?
                      </p>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-xs text-primary-500 font-semibold hover:underline disabled:opacity-40"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </form>
                )}

                {/* ── Forgot Password Form ── */}
                {mode === "forgot" && (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
                      <p className="text-xs leading-relaxed">
                        Enter your registered email address and we'll send you
                        a 6-digit OTP to reset your password.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="admin@urbannile.com"
                          className="w-full border-2 border-gray-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-dark-400 transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-60 group"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          Send Reset OTP
                          <ArrowRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                      Remember your password?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setError("");
                        }}
                        className="text-primary-500 font-semibold hover:underline"
                      >
                        Back to Login
                      </button>
                    </p>
                  </form>
                )}

                {/* ── Reset Password Form ── */}
                {mode === "reset" && (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div className="bg-primary-500/10 border border-primary-500/30 p-4 text-sm text-primary-700">
                      <p className="text-xs leading-relaxed">
                        Enter the 6-digit OTP sent to{" "}
                        <strong>{pendingEmail}</strong> and your new password.
                      </p>
                    </div>

                    {/* OTP */}
                    <div>
                      <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                        OTP Code
                      </label>
                      <input
                        name="otp"
                        type="text"
                        value={form.otp}
                        onChange={handleChange}
                        maxLength={6}
                        placeholder="• • • • • •"
                        className="w-full border-2 border-gray-200 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-dark-400 focus:outline-none focus:border-dark-400 transition-colors"
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          name="newPassword"
                          type={showPass ? "text" : "password"}
                          value={form.newPassword}
                          onChange={handleChange}
                          placeholder="Min. 8 characters"
                          className="w-full border-2 border-gray-200 pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-dark-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark-400"
                        >
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-60 group"
                    >
                      {loading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          Reset Password
                          <ArrowRight
                            size={16}
                            className="group-hover:translate-x-1 transition-transform"
                          />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-600 text-xs mt-6 tracking-wider">
              © {new Date().getFullYear()} Urban Nile Admin Panel
            </p>
          </div>
        </div>
      );
    };

    export default AdminLoginPage;
           
           
           
           