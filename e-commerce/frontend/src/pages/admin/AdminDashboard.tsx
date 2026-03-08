import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Clock,
  LogOut,
  ChevronRight,
  BarChart2,
  Users,
} from "lucide-react";
import { orderService } from "../../services/orderService";
import { authService } from "../../services/authService";
import { OrderStats, Order } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
  processing: "bg-purple-100 text-purple-700 border border-purple-200",
  shipped: "bg-indigo-100 text-indigo-700 border border-indigo-200",
  delivered: "bg-green-100 text-green-700 border border-green-200",
  cancelled: "bg-red-100 text-red-700 border border-red-200",
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = authService.getStoredUser();

  const [stats, setStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          orderService.getOrderStats(),
          orderService.getOrders({ limit: 5 }),
        ]);
        setStats(statsRes.stats);
        setRecentOrders(ordersRes.orders);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  if (loading) return <LoadingSpinner size="lg" fullScreen text="Loading Dashboard" />;

  const statCards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      color: "bg-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Pending Orders",
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: "bg-yellow-500",
      bg: "bg-yellow-50",
      text: "text-yellow-600",
    },
    {
      label: "Delivered",
      value: stats?.deliveredOrders ?? 0,
      icon: Package,
      color: "bg-green-500",
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "Total Revenue",
      value: `EGP ${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-primary-500",
      bg: "bg-primary-50",
      text: "text-primary-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Bar ── */}
      <header className="bg-dark-400 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex flex-col leading-none">
              <span className="text-white font-bold text-lg tracking-[0.25em]">
                URBAN
              </span>
              <span className="text-primary-500 text-[9px] tracking-[0.5em] -mt-0.5">
                NILE
              </span>
            </Link>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-primary-500" />
              <span className="text-white text-sm font-semibold tracking-wider">
                Admin Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-dark-400 font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-300 text-sm">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-dark-400">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening with Urban Nile today.
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map(({ label, value, icon: Icon, bg, text }) => (
            <div
              key={label}
              className="bg-white shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                    {label}
                  </p>
                  <p className={`text-2xl font-bold ${text}`}>{value}</p>
                </div>
                <div className={`${bg} p-3 rounded-full`}>
                  <Icon size={22} className={text} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Nav ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              to: "/admin/products",
              icon: Package,
              label: "Manage Products",
              desc: "Add, edit, or remove products",
              color: "border-l-blue-500",
            },
            {
              to: "/admin/orders",
              icon: ShoppingBag,
              label: "View All Orders",
              desc: "Review and update order statuses",
              color: "border-l-primary-500",
            },
            {
              to: "/",
              icon: Users,
              label: "Visit Storefront",
              desc: "See how your store looks",
              color: "border-l-green-500",
            },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className={`bg-white border border-gray-100 border-l-4 ${color} p-5 flex items-center justify-between hover:shadow-md transition-shadow group`}
            >
              <div className="flex items-center gap-4">
                <Icon size={22} className="text-gray-400 group-hover:text-dark-400 transition-colors" />
                <div>
                  <p className="font-bold text-dark-400 text-sm">{label}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-gray-400 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          ))}
        </div>

        {/* ── Recent Orders ── */}
        <div className="bg-white shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-dark-400 tracking-wider text-sm uppercase">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-xs text-primary-500 hover:text-primary-700 font-semibold flex items-center gap-1"
            >
              View All <ChevronRight size={13} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["Order #", "Customer", "Items", "Total", "Status", "Date"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left text-xs font-bold text-gray-500 tracking-widest uppercase"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-dark-400 text-xs tracking-wider">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-dark-400 text-xs">
                          {order.customerName}
                        </p>
                        <p className="text-gray-400 text-[11px]">{order.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {order.products.length}{" "}
                        {order.products.length === 1 ? "item" : "items"}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary-600 text-xs">
                        EGP {order.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[11px] px-3 py-1 font-semibold capitalize ${
                            STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-EG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;