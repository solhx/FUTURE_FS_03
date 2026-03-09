import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Providers
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartSidebar from "./components/CartSidebar";
import ProtectedRoute from "./components/ProtectedRoute";

// Customer Pages
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import LoginPage from "./pages/LoginPage";
import MyOrdersPage from "./pages/MyOrdersPage";

// Admin Pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";

// ── Layout Wrapper ──
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && <Navbar />}
      {!isAdminPage && <CartSidebar />}
      <main className="flex-1">{children}</main>
      {!isAdminPage && <Footer />}
    </div>
  );
};

// ── Not Found Page ──
const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-dark-400 flex items-center justify-center px-4">
    <div className="text-center animate-fade-in">
      <p className="text-primary-500 text-8xl md:text-9xl font-bold mb-4 leading-none">
        404
      </p>
      <h1 className="text-white text-3xl font-bold tracking-wider mb-3">
        PAGE NOT FOUND
      </h1>
      <p className="text-gray-500 text-sm mb-10 max-w-xs mx-auto leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-3 bg-primary-500 text-dark-400 px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-white transition-colors duration-300"
      >
        Back to Home
      </a>
    </div>
  </div>
);

// ── App ──
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            gutter={8}
            containerStyle={{ top: 84 }}
            toastOptions={{
              duration: 3500,
              style: {
                background: "#1a1a1a",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "500",
                letterSpacing: "0.02em",
                borderRadius: "0px",
                padding: "14px 18px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.08)",
              },
              success: {
                iconTheme: {
                  primary: "#c9a96e",
                  secondary: "#1a1a1a",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
                style: {
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "1px solid rgba(239,68,68,0.3)",
                },
              },
            }}
          />

          <AppLayout>
            <Routes>
              {/* ── Public Customer Routes ── */}
              <Route path="/"         element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/cart"     element={<CartPage />} />
              <Route path="/login"    element={<LoginPage />} />

              {/* ── Protected Customer Routes ── */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/order-confirmation"
                element={
                  <ProtectedRoute>
                    <OrderConfirmationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectedRoute>
                    <MyOrdersPage />
                  </ProtectedRoute>
                }
              />

              {/* ── Admin Routes ── */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />

              {/* ── 404 ── */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AppLayout>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;