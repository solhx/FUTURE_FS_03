import React from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  ArrowRight,
  Mail,
} from "lucide-react";
import { Order } from "../types";

const STATUS_STEPS = [
  { key: "pending", label: "Order Placed", icon: CheckCircle },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const order = location.state?.order as Order | undefined;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Success Banner */}
      <div className="bg-dark-400 py-16 text-center">
        <div className="w-20 h-20 bg-primary-500/20 border-2 border-primary-500 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={36} className="text-primary-500" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider mb-2">
          ORDER CONFIRMED!
        </h1>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          Thank you,{" "}
          <span className="text-primary-400 font-semibold">
            {order.customerName}
          </span>
          ! Your order has been placed successfully.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Order Number */}
        <div className="bg-white border border-gray-100 shadow-sm text-center py-8 px-6">
          <p className="text-xs text-gray-400 tracking-[0.4em] uppercase mb-2">
            Order Number
          </p>
          <p className="text-3xl font-bold text-dark-400 tracking-[0.15em] mb-3">
            {order.orderNumber}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Mail size={14} className="text-primary-500" />
            Confirmation sent to{" "}
            <span className="font-semibold text-dark-400">{order.email}</span>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-xs font-bold text-dark-400 tracking-[0.3em] uppercase mb-6 pb-3 border-b border-gray-100">
            Order Status
          </h2>
          <div className="relative flex items-start justify-between">
            {/* Progress Line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0">
              <div
                className="h-full bg-primary-500 transition-all duration-500"
                style={{
                  width: `${
                    (STATUS_STEPS.findIndex((s) => s.key === order.status) /
                      (STATUS_STEPS.length - 1)) *
                    100
                  }%`,
                }}
              />
            </div>

            {STATUS_STEPS.map((step) => {
              const isActive =
                STATUS_STEPS.findIndex((s) => s.key === order.status) >=
                STATUS_STEPS.findIndex((s) => s.key === step.key);
              const { icon: Icon } = step;
              return (
                <div
                  key={step.key}
                  className="relative z-10 flex flex-col items-center gap-2 flex-1"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isActive
                        ? "bg-primary-500 border-primary-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Icon
                      size={14}
                      className={isActive ? "text-dark-400" : "text-gray-400"}
                    />
                  </div>
                  <span
                    className={`text-center text-[10px] font-semibold tracking-wider leading-tight ${
                      isActive ? "text-dark-400" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-gray-100 shadow-sm">
          <div className="bg-dark-400 px-6 py-4">
            <h2 className="text-sm font-bold text-white tracking-[0.2em] uppercase">
              Items Ordered
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {order.products.map((item, idx) => (
              <div key={idx} className="flex gap-4 p-5">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <p className="font-bold text-dark-400 text-sm mb-1">
                    {item.name}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-500 mb-2">
                    <span>Size: {item.size}</span>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <p className="text-primary-600 font-bold text-sm">
                    EGP {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="p-5 border-t border-gray-100 space-y-2 bg-gray-50">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>EGP {order.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span>
              <span>EGP {order.shippingPrice}</span>
            </div>
            <div className="flex justify-between font-bold text-dark-400 text-lg pt-2 border-t border-gray-200">
              <span>Total Paid</span>
              <span className="text-primary-600">
                EGP {(order.totalPrice + order.shippingPrice).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white border border-gray-100 shadow-sm p-6">
          <h2 className="text-xs font-bold text-dark-400 tracking-[0.3em] uppercase mb-4 pb-3 border-b border-gray-100">
            Delivery Details
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: "Name", value: order.customerName },
              { label: "Phone", value: order.phone },
              {
                label: "Address",
                value: `${order.address}, ${order.city}`,
              },
              { label: "Governorate", value: order.governorate },
              {
                label: "Payment",
                value:
                  order.paymentMethod === "cash_on_delivery"
                    ? "Cash on Delivery"
                    : "Online Payment",
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  {label}
                </p>
                <p className="text-dark-400 font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/products"
            className="flex-1 flex items-center justify-center gap-3 bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors duration-300 group"
          >
            Continue Shopping
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center border-2 border-dark-400 text-dark-400 py-4 text-sm font-bold tracking-widest uppercase hover:bg-dark-400 hover:text-white transition-colors duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;