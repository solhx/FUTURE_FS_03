import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag, Package, Truck, MapPin, CheckCircle,
  Clock, X, ChevronDown, ChevronUp, ArrowRight,
} from "lucide-react";
import { orderService } from "../services/orderService";
import { Order } from "../types";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string;
  border: string; icon: React.ElementType; step: number;
}> = {
  pending:    { label: "Order Placed",  color: "text-yellow-700",  bg: "bg-yellow-50",  border: "border-yellow-200", icon: Clock,        step: 1 },
  confirmed:  { label: "Confirmed",     color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",   icon: CheckCircle,  step: 2 },
  processing: { label: "Processing",    color: "text-purple-700",  bg: "bg-purple-50",  border: "border-purple-200", icon: Package,      step: 3 },
  shipped:    { label: "Shipped",       color: "text-indigo-700",  bg: "bg-indigo-50",  border: "border-indigo-200", icon: Truck,        step: 4 },
  delivered:  { label: "Delivered",     color: "text-green-700",   bg: "bg-green-50",   border: "border-green-200",  icon: MapPin,       step: 5 },
  cancelled:  { label: "Cancelled",     color: "text-red-700",     bg: "bg-red-50",     border: "border-red-200",    icon: X,            step: 0 },
};

const TRACKING_STEPS = [
  { key: "pending",    label: "Order\nPlaced",   icon: ShoppingBag },
  { key: "confirmed",  label: "Confirmed",        icon: CheckCircle },
  { key: "processing", label: "Processing",       icon: Package     },
  { key: "shipped",    label: "Shipped",          icon: Truck       },
  { key: "delivered",  label: "Delivered",        icon: MapPin      },
];

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg     = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const Icon    = cfg.icon;
  const isCancelled = order.status === "cancelled";

  return (
    <div className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.bg} ${cfg.border} border`}>
            <Icon size={18} className={cfg.color} />
          </div>
          <div>
            <p className="font-bold text-dark-400 text-sm tracking-wider">
              {order.orderNumber}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-EG", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-primary-600 text-sm">
              EGP {(order.totalPrice + order.shippingPrice).toLocaleString()}
            </p>
            <p className="text-gray-400 text-xs">
              {order.products.length} {order.products.length === 1 ? "item" : "items"}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 border ${cfg.bg} ${cfg.color} ${cfg.border} capitalize hidden sm:inline-flex items-center gap-1.5`}>
            <Icon size={11} />
            {cfg.label}
          </span>
          {expanded ? (
            <ChevronUp size={18} className="text-gray-400" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Mobile status */}
      <div className="sm:hidden px-5 pb-4 flex items-center justify-between">
        <span className={`text-xs font-bold px-3 py-1.5 border ${cfg.bg} ${cfg.color} ${cfg.border} capitalize inline-flex items-center gap-1.5`}>
          <Icon size={11} /> {cfg.label}
        </span>
        <p className="font-bold text-primary-600 text-sm">
          EGP {(order.totalPrice + order.shippingPrice).toLocaleString()}
        </p>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-100 animate-fade-in">
          {/* Tracking Bar */}
          {!isCancelled && (
            <div className="px-6 py-6 bg-gray-50 border-b border-gray-100">
              <p className="text-xs font-bold text-dark-400 tracking-[0.3em] uppercase mb-5">
                Order Tracking
              </p>
              <div className="relative flex items-start justify-between">
                {/* Progress line */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0">
                  <div
                    className="h-full bg-primary-500 transition-all duration-700"
                    style={{
                      width: `${
                        ((STATUS_CONFIG[order.status]?.step ?? 1) - 1) /
                        (TRACKING_STEPS.length - 1) * 100
                      }%`,
                    }}
                  />
                </div>

                {TRACKING_STEPS.map((step) => {
                  const currentStep = STATUS_CONFIG[order.status]?.step ?? 1;
                  const stepNum = STATUS_CONFIG[step.key]?.step ?? 1;
                  const isCompleted = currentStep >= stepNum;
                  const isCurrent   = currentStep === stepNum;
                  const StepIcon    = step.icon;

                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        isCompleted
                          ? "bg-primary-500 border-primary-500 shadow-md"
                          : "bg-white border-gray-300"
                      } ${isCurrent ? "ring-4 ring-primary-500/20" : ""}`}>
                        <StepIcon size={14} className={isCompleted ? "text-dark-400" : "text-gray-400"} />
                      </div>
                      <p className={`text-center text-[10px] font-semibold tracking-wide leading-tight whitespace-pre-line ${
                        isCompleted ? "text-dark-400" : "text-gray-400"
                      }`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="text-[9px] text-primary-500 font-bold tracking-wider animate-pulse">
                          CURRENT
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center gap-3">
              <X size={18} className="text-red-500" />
              <p className="text-red-700 text-sm font-semibold">
                This order has been cancelled.
              </p>
            </div>
          )}

          {/* Products List */}
          <div className="p-5">
            <p className="text-xs font-bold text-dark-400 tracking-[0.3em] uppercase mb-4">
              Items Ordered ({order.products.length})
            </p>
            <div className="space-y-3 mb-5">
              {order.products.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-gray-50 p-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-16 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-dark-400 text-sm truncate">{item.name}</p>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      <span>Size: <strong className="text-dark-400">{item.size}</strong></span>
                      <span>Qty: <strong className="text-dark-400">{item.quantity}</strong></span>
                    </div>
                  </div>
                  <p className="text-primary-600 font-bold text-sm flex-shrink-0">
                    EGP {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>EGP {order.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className={order.shippingPrice === 0 ? "text-green-600 font-semibold" : ""}>
                  {order.shippingPrice === 0 ? "FREE" : `EGP ${order.shippingPrice}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-dark-400 text-base pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary-600">
                  EGP {(order.totalPrice + order.shippingPrice).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mt-5 bg-dark-400 p-4 grid grid-cols-2 gap-3">
              {[
                { label: "Deliver To",   value: order.customerName },
                { label: "Phone",         value: order.phone         },
                { label: "Address",       value: `${order.address}, ${order.city}` },
                { label: "Governorate",   value: order.governorate   },
                { label: "Payment",       value: order.paymentMethod === "cash_on_delivery" ? "Cash on Delivery" : "Online" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-white text-xs font-semibold truncate">{value}</p>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="mt-3 bg-yellow-50 border border-yellow-100 p-3">
                <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider mb-1">
                  Notes
                </p>
                <p className="text-yellow-800 text-xs">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MyOrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [orders,      setOrders]      = useState<Order[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [total,       setTotal]       = useState(0);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await orderService.getMyOrders({ page: currentPage, limit: 8 });
        setOrders(data.orders);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-dark-400 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-primary-500 text-xs tracking-[0.4em] uppercase font-semibold mb-2">
            Account
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
            MY ORDERS
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Hello, <span className="text-primary-400 font-semibold">{user?.name}</span> —{" "}
            {total} {total === 1 ? "order" : "orders"} total
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="md" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-100 py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={36} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-dark-400 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 text-sm mb-8">
              You haven't placed any orders yet. Start shopping!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-3 bg-dark-400 text-white px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors group"
            >
              Browse Products
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Orders",  value: total },
                { label: "Pending",       value: orders.filter((o) => o.status === "pending").length    },
                { label: "In Transit",    value: orders.filter((o) => o.status === "shipped").length    },
                { label: "Delivered",     value: orders.filter((o) => o.status === "delivered").length  },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-gray-100 p-4 text-center shadow-sm">
                  <p className="text-2xl font-bold text-primary-500">{value}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center text-dark-400 hover:bg-dark-400 hover:text-white transition-all disabled:opacity-30 font-bold"
                >
                  ‹
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 border-2 text-sm font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-dark-400 text-white border-dark-400"
                        : "border-gray-200 text-dark-400 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center text-dark-400 hover:bg-dark-400 hover:text-white transition-all disabled:opacity-30 font-bold"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;