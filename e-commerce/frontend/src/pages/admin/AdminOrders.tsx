import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Eye,
  X,
  RefreshCw,
  ShoppingBag,
  Filter,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { Order } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import toast from "react-hot-toast";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
  processing: "bg-purple-100 text-purple-700 border border-purple-200",
  shipped: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  delivered: "bg-green-100 text-green-700 border border-green-200",
  cancelled: "bg-red-100 text-red-700 border border-red-200",
};

const ALL_STATUSES = [
  "all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled",
];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders({
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: currentPage,
        limit: 15,
      });
      setOrders(data.orders);
      setTotalPages(data.totalPages);
      setTotalOrders(data.total);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const updated = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated.order : o))
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(updated.order);
      }
      toast.success(`Order status updated to "${newStatus}"`);
    } catch {
      toast.error("Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-dark-400 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex flex-col leading-none">
              <span className="text-white font-bold text-lg tracking-[0.25em]">URBAN</span>
              <span className="text-primary-500 text-[9px] tracking-[0.5em] -mt-0.5">NILE</span>
            </Link>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Link to="/admin" className="hover:text-white transition-colors">Dashboard</Link>
              <ChevronRight size={12} />
              <span className="text-white font-semibold">Orders</span>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <RefreshCw size={15} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-dark-400">Orders</h1>
            <p className="text-gray-500 text-sm">{totalOrders} total orders</p>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-gray-400" />
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all capitalize ${
                  statusFilter === s
                    ? "bg-dark-400 text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-dark-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="md" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-gray-100 py-20 text-center">
            <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-dark-400 mb-2">No orders found</h3>
            <p className="text-gray-500 text-sm">
              {statusFilter !== "all"
                ? `No ${statusFilter} orders at the moment`
                : "Orders will appear here once customers start shopping"}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {[
                        "Order #", "Customer", "Items", "Total",
                        "Payment", "Status", "Date", "Actions",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-bold text-gray-500 tracking-widest uppercase whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 font-bold text-dark-400 text-xs tracking-wider">
                          {order.orderNumber}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-dark-400 text-xs">
                            {order.customerName}
                          </p>
                          <p className="text-gray-400 text-[11px]">{order.phone}</p>
                          <p className="text-gray-400 text-[11px]">{order.city}</p>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">
                          {order.products.length}{" "}
                          {order.products.length === 1 ? "item" : "items"}
                        </td>
                        <td className="px-5 py-4 font-bold text-primary-600 text-xs">
                          EGP {order.totalPrice.toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 capitalize">
                            {order.paymentMethod === "cash_on_delivery"
                              ? "COD"
                              : "Online"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(order._id, e.target.value)
                            }
                            disabled={updatingId === order._id}
                            className={`text-[11px] font-semibold px-2 py-1 border-0 cursor-pointer focus:outline-none capitalize ${
                              STATUS_COLORS[order.status] ?? "bg-gray-100"
                            } disabled:opacity-50`}
                          >
                            {ALL_STATUSES.filter((s) => s !== "all").map((s) => (
                              <option key={s} value={s} className="bg-white text-gray-800">
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString("en-EG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-primary-500 hover:bg-primary-50 transition-colors rounded"
                            title="View Details"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
                            {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center text-dark-400 hover:bg-dark-400 hover:text-white hover:border-dark-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                    >
                      ‹
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      const isNear =
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1;
                      if (!isNear) {
                        if (page === 2 || page === totalPages - 1) {
                          return (
                            <span key={page} className="text-gray-400 text-sm px-1">
                              …
                            </span>
                          );
                        }
                        return null;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 border-2 text-sm font-bold transition-all ${
                            currentPage === page
                              ? "bg-dark-400 text-white border-dark-400"
                              : "border-gray-200 text-dark-400 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 border-2 border-gray-200 flex items-center justify-center text-dark-400 hover:bg-dark-400 hover:text-white hover:border-dark-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Order Detail Modal ── */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
              <div className="bg-white w-full max-w-2xl my-8 shadow-2xl animate-slide-up">
                {/* Modal Header */}
                <div className="bg-dark-400 px-6 py-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-bold tracking-wider text-sm uppercase">
                      Order Details
                    </h2>
                    <p className="text-primary-400 text-xs mt-0.5 tracking-widest">
                      {selectedOrder.orderNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
                  {/* Status Update */}
                  <div className="bg-gray-50 border border-gray-100 p-4">
                    <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-3">
                      Update Order Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALL_STATUSES.filter((s) => s !== "all").map((s) => (
                        <button
                          key={s}
                          onClick={() =>
                            handleStatusUpdate(selectedOrder._id, s)
                          }
                          disabled={
                            updatingId === selectedOrder._id ||
                            selectedOrder.status === s
                          }
                          className={`px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all capitalize ${
                            selectedOrder.status === s
                              ? "bg-dark-400 text-white cursor-default"
                              : "border border-gray-200 text-gray-500 hover:border-dark-400 hover:text-dark-400 disabled:opacity-40"
                          }`}
                        >
                          {updatingId === selectedOrder._id &&
                          selectedOrder.status !== s ? (
                            <span className="flex items-center gap-1">
                              <LoadingSpinner size="sm" />
                            </span>
                          ) : (
                            s
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-xs font-bold text-dark-400 tracking-[0.3em] uppercase mb-3 pb-2 border-b border-gray-100">
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Name", value: selectedOrder.customerName },
                        { label: "Email", value: selectedOrder.email },
                        { label: "Phone", value: selectedOrder.phone },
                        {
                          label: "Address",
                          value: `${selectedOrder.address}, ${selectedOrder.city}`,
                        },
                        {
                          label: "Governorate",
                          value: selectedOrder.governorate,
                        },
                        {
                          label: "Payment",
                          value:
                            selectedOrder.paymentMethod === "cash_on_delivery"
                              ? "Cash on Delivery"
                              : "Online Payment",
                        },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                            {label}
                          </p>
                          <p className="text-dark-400 font-semibold text-sm break-words">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {selectedOrder.notes && (
                      <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3">
                        <p className="text-[10px] text-yellow-600 uppercase tracking-wider font-bold mb-1">
                          Customer Notes
                        </p>
                        <p className="text-sm text-yellow-800">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Ordered Items */}
                  <div>
                    <h3 className="text-xs font-bold text-dark-400 tracking-[0.3em] uppercase mb-3 pb-2 border-b border-gray-100">
                      Ordered Items ({selectedOrder.products.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.products.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 items-center bg-gray-50 p-3"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-16 object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-dark-400 text-sm truncate">
                              {item.name}
                            </p>
                            <div className="flex gap-4 text-xs text-gray-500 mt-1">
                              <span>Size: <strong>{item.size}</strong></span>
                              <span>Qty: <strong>{item.quantity}</strong></span>
                              <span>
                                EGP{" "}
                                <strong>
                                  {item.price.toLocaleString()}
                                </strong>{" "}
                                each
                              </span>
                            </div>
                          </div>
                          <p className="text-primary-600 font-bold text-sm flex-shrink-0">
                            EGP {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-dark-400 p-5">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Subtotal</span>
                        <span>EGP {selectedOrder.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>Shipping</span>
                        <span>EGP {selectedOrder.shippingPrice}</span>
                      </div>
                      <div className="flex justify-between font-bold text-white text-lg pt-2 border-t border-white/20 mt-2">
                        <span>Grand Total</span>
                        <span className="text-primary-400">
                          EGP{" "}
                          {(
                            selectedOrder.totalPrice + selectedOrder.shippingPrice
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Meta */}
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      Placed:{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString("en-EG")}
                    </span>
                    <span>
                      Updated:{" "}
                      {new Date(selectedOrder.updatedAt).toLocaleString("en-EG")}
                    </span>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-8 py-2.5 bg-dark-400 text-white text-sm font-bold tracking-wider uppercase hover:bg-primary-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    export default AdminOrders;

        
        
        
        
        
        
    