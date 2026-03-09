    import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  CreditCard,
  Truck,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { orderService } from "../services/orderService";
import { CheckoutFormData } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const EGYPTIAN_GOVERNORATES = [
  "Cairo", "Giza", "Alexandria", "Luxor", "Aswan", "Assiut",
  "Beheira", "Beni Suef", "Dakahlia", "Damietta", "Faiyum",
  "Gharbia", "Ismailia", "Kafr El Sheikh", "Matruh", "Minya",
  "Monufia", "New Valley", "North Sinai", "Port Said", "Qalyubia",
  "Qena", "Red Sea", "Sharqia", "Sohag", "South Sinai", "Suez",
];

const initialForm: CheckoutFormData = {
  customerName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  governorate: "",
  postalCode: "",
  paymentMethod: "cash_on_delivery",
  notes: "",
};

// InputWrapper component moved outside to prevent remounting on every render
const InputWrapper: React.FC<{
  label: string;
  icon: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, icon, error, required, children }) => (
  <div>
    <label className="flex items-center gap-2 text-xs font-bold text-dark-400 tracking-widest uppercase mb-2">
      {icon}
      {label}
      {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5">
        <AlertCircle size={11} />
        {error}
      </p>
    )}
  </div>
);

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, totalPrice, clearCart } = useCart();
  const { items } = state;
  const { user } = useAuth();

  const [form, setForm] = useState<CheckoutFormData>(initialForm);
  const [errors, setErrors] = useState<Partial<CheckoutFormData>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const shippingPrice = totalPrice >= 800 ? 0 : 50;
  const grandTotal = totalPrice + shippingPrice;
useEffect(() => {
  if (user) {
    setForm((prev) => ({
      ...prev,
      customerName: prev.customerName || user.name,
      email:        prev.email        || user.email,
    }));
  }
}, [user]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-400 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Add items before checking out
          </p>
          <Link
            to="/products"
            className="bg-dark-400 text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  const validate = (): boolean => {
    const newErrors: Partial<CheckoutFormData> = {};
    if (!form.customerName.trim())
      newErrors.customerName = "Full name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^(\+20|0)?1[0-2,5]\d{8}$/.test(form.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid Egyptian phone number";
    }
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.governorate) newErrors.governorate = "Please select a governorate";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof CheckoutFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleContinue = () => {
    if (validate()) setStep(2);
    else toast.error("Please fix the errors before continuing");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await orderService.createOrder(form, items);
      clearCart();
      toast.success("Order placed successfully! 🎉");
      navigate("/order-confirmation", {
        state: { order: result.order },
        replace: true,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to place order. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: keyof CheckoutFormData) =>
    `w-full border-2 px-4 py-3 text-sm text-dark-400 focus:outline-none transition-colors ${
      errors[field]
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 focus:border-dark-400"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-dark-400 py-12 text-center">
        <p className="text-primary-500 text-xs tracking-[0.4em] uppercase font-semibold mb-2">
          Almost There
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
          CHECKOUT
        </h1>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-0">
          {[
            { num: 1, label: "Shipping Info" },
            { num: 2, label: "Review & Pay" },
          ].map(({ num, label }, i) => (
            <React.Fragment key={num}>
              <button
                onClick={() => num < step && setStep(num as 1 | 2)}
                className={`flex items-center gap-2 px-5 py-2 text-xs font-bold tracking-wider uppercase transition-colors ${
                  step >= num
                    ? "text-primary-600"
                    : "text-gray-400 cursor-default"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    step >= num
                      ? "bg-primary-500 border-primary-500 text-dark-400"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {num}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < 1 && (
                <ChevronRight size={16} className="text-gray-300 mx-1" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left: Form ── */}
            <div className="lg:col-span-2">
              {/* Step 1 – Shipping */}
              {step === 1 && (
                <div className="bg-white shadow-sm border border-gray-100 animate-fade-in">
                  <div className="bg-dark-400 px-6 py-4 flex items-center gap-3">
                    <Truck size={18} className="text-primary-500" />
                    <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">
                      Shipping Information
                    </h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                      <InputWrapper
                        label="Full Name"
                        icon={<User size={13} />}
                        error={errors.customerName}
                        required
                      >
                        <input
                          name="customerName"
                          type="text"
                          value={form.customerName}
                          onChange={handleChange}
                          placeholder="Ahmed Hassan"
                          className={inputCls("customerName")}
                        />
                      </InputWrapper>
                    </div>

                    {/* Email */}
                    <InputWrapper
                      label="Email"
                      icon={<Mail size={13} />}
                      error={errors.email}
                      required
                    >
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="ahmed@example.com"
                        className={inputCls("email")}
                      />
                    </InputWrapper>

                    {/* Phone */}
                    <InputWrapper
                      label="Phone Number"
                      icon={<Phone size={13} />}
                      error={errors.phone}
                      required
                    >
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="01XXXXXXXXX"
                        className={inputCls("phone")}
                      />
                    </InputWrapper>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <InputWrapper
                        label="Street Address"
                        icon={<MapPin size={13} />}
                        error={errors.address}
                        required
                      >
                        <input
                          name="address"
                          type="text"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="123 Tahrir Square, Apt 4B"
                          className={inputCls("address")}
                        />
                      </InputWrapper>
                    </div>

                    {/* City */}
                    <InputWrapper
                      label="City"
                      icon={<Building2 size={13} />}
                      error={errors.city}
                      required
                    >
                      <input
                        name="city"
                        type="text"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Cairo"
                        className={inputCls("city")}
                      />
                    </InputWrapper>

                    {/* Governorate */}
                    <InputWrapper
                      label="Governorate"
                      icon={<MapPin size={13} />}
                      error={errors.governorate}
                      required
                    >
                      <select
                        name="governorate"
                        value={form.governorate}
                        onChange={handleChange}
                        className={`${inputCls("governorate")} bg-white cursor-pointer`}
                      >
                        <option value="">Select Governorate</option>
                        {EGYPTIAN_GOVERNORATES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </InputWrapper>

                    {/* Postal Code */}
                    <InputWrapper
                      label="Postal Code (Optional)"
                      icon={<FileText size={13} />}
                    >
                      <input
                        name="postalCode"
                        type="text"
                        value={form.postalCode}
                        onChange={handleChange}
                        placeholder="11511"
                        className="w-full border-2 border-gray-200 px-4 py-3 text-sm text-dark-400 focus:outline-none focus:border-dark-400 transition-colors"
                      />
                    </InputWrapper>

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <InputWrapper
                        label="Order Notes (Optional)"
                        icon={<FileText size={13} />}
                      >
                        <textarea
                          name="notes"
                          value={form.notes}
                          onChange={handleChange}
                          rows={3}
                          placeholder="Special delivery instructions..."
                          className="w-full border-2 border-gray-200 px-4 py-3 text-sm text-dark-400 focus:outline-none focus:border-dark-400 transition-colors resize-none"
                        />
                      </InputWrapper>
                    </div>
                  </div>

                  {/* Continue Button */}
                  <div className="px-6 pb-6">
                    <button
                      type="button"
                      onClick={handleContinue}
                      className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors duration-300 flex items-center justify-center gap-3 group"
                    >
                      Continue to Review
                      <ChevronRight
                        size={16}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 – Review & Payment */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  {/* Shipping Summary */}
                  <div className="bg-white shadow-sm border border-gray-100">
                    <div className="bg-dark-400 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Truck size={18} className="text-primary-500" />
                        <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">
                          Shipping To
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-primary-400 text-xs hover:text-primary-300 underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {[
                        { label: "Name", value: form.customerName },
                        { label: "Email", value: form.email },
                        { label: "Phone", value: form.phone },
                        {
                          label: "Address",
                          value: `${form.address}, ${form.city}`,
                        },
                        { label: "Governorate", value: form.governorate },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                            {label}
                          </p>
                          <p className="text-dark-400 font-medium text-sm truncate">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-white shadow-sm border border-gray-100">
                    <div className="bg-dark-400 px-6 py-4 flex items-center gap-3">
                      <CreditCard size={18} className="text-primary-500" />
                      <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">
                        Payment Method
                      </h2>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        {
                          value: "cash_on_delivery",
                          label: "Cash on Delivery",
                          desc: "Pay when your order arrives",
                          icon: "💵",
                        },
                        {
                          value: "online",
                          label: "Online Payment",
                          desc: "Visa / MasterCard",
                          icon: "💳",
                        },
                      ].map((method) => (
                        <label
                          key={method.value}
                          className={`flex items-center gap-4 p-4 border-2 cursor-pointer transition-all ${
                            form.paymentMethod === method.value
                              ? "border-dark-400 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.value}
                            checked={form.paymentMethod === method.value}
                            onChange={handleChange}
                            className="accent-dark-400"
                          />
                          <span className="text-xl">{method.icon}</span>
                          <div>
                            <p className="font-bold text-dark-400 text-sm">
                              {method.label}
                            </p>
                            <p className="text-gray-500 text-xs">{method.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-500 text-dark-400 py-5 text-sm font-bold tracking-widest uppercase hover:bg-primary-600 transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        Place Order — EGP {grandTotal.toLocaleString()}
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    🔒 By placing your order, you agree to our{" "}
                    <a href="#" className="underline hover:text-dark-400">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="underline hover:text-dark-400">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-sm border border-gray-100 sticky top-24">
                <div className="bg-dark-400 px-6 py-4">
                  <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">
                    Order Items ({items.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map((item, idx) => (
                    <div
                      key={`checkout-${item.product._id}-${item.size}-${idx}`}
                      className="flex gap-3 p-4"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-18 object-cover"
                        />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-dark-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-dark-400 leading-tight truncate mb-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-gray-400 mb-1">
                          Size: {item.size}
                        </p>
                        <p className="text-xs font-bold text-primary-600">
                          EGP{" "}
                          {(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="p-5 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>EGP {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span
                      className={
                        shippingPrice === 0 ? "text-green-600 font-semibold" : ""
                      }
                    >
                      {shippingPrice === 0 ? "FREE" : `EGP ${shippingPrice}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-dark-400 text-lg pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-primary-600">
                      EGP {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;