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
  <div className="min-h-screen bg-gradient-to-b from-dark-400 via-dark-400 to-dark-500 flex items-center justify-center px-4 py-12 relative overflow-hidden">
    {/* Floating particles */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-20 right-20 w-20 h-20 md:w-32 md:h-32 bg-primary-300/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-32 left-16 w-16 h-16 md:w-24 md:h-24 bg-sand-200/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}} />
      <div className="absolute top-1/2 left-8 w-12 h-12 md:w-20 md:h-20 bg-primary-400/5 rounded-full blur-lg animate-bounce" />
    </div>
    
    <div className="relative z-10 text-center max-w-lg mx-auto animate-slide-up">
      {/* Lost Shopping Bag */}
      <div className="mx-auto mb-12 relative group">
        <div className="w-28 h-28 md:w-36 md:h-36 mx-auto bg-gradient-to-br from-sand-100 to-sand-200 rounded-3xl shadow-2xl relative transform group-hover:-rotate-3 transition-transform duration-500">
          <div className="absolute -bottom-2 -right-2 w-full h-full bg-black/10 rounded-3xl blur-sm -z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-sand-300/80 via-sand-200/90 to-white rounded-3xl shadow-xl" />
          <div className="absolute top-0 left-3 right-3 h-10 bg-gradient-to-b from-white/90 to-sand-100 rounded-t-2xl border-b border-sand-400 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full blur-sm animate-pulse" />
          </div>
          <div className="absolute top-1 left-3 w-10 h-3 bg-sand-400 rounded-full shadow-sm" />
          <div className="absolute top-1 right-3 w-10 h-3 bg-sand-400 rounded-full shadow-sm" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-white/30">
            <span className="text-sm md:text-base font-black text-dark-400 drop-shadow-sm animate-pulse">?</span>
          </div>
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary-400 rounded-full opacity-75 animate-ping" />
        </div>
        <p className="absolute -top-3 -right-4 md:-right-6 text-xs md:text-sm text-primary-500 font-bold tracking-wider uppercase bg-dark-400 px-2 py-1 rounded-full shadow-md animate-bounce">
          Lost!
        </p>
      </div>
      
      <h1 className="text-8xl md:text-[10rem] font-black tracking-tight bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent leading-none drop-shadow-2xl animate-shake">
        404
      </h1>
      
      <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-6 text-white/95 drop-shadow-lg">
        Page Not Found
      </h2>
      
      <p className="text-gray-300/90 text-lg md:text-xl mb-12 leading-relaxed max-w-sm mx-auto font-medium">
        Oops! The page you're looking for doesn't exist. <span className="text-primary-400 animate-pulse">Maybe it's on vacation? 🌴</span>
      </p>
      
      <a
        href="/"
        className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-500 to-primary-600 text-dark-400 px-12 py-5 text-sm font-bold tracking-widest uppercase hover:from-primary-400 hover:to-primary-500 hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg rounded-full group btn-primary"
      >
        <span>← Back to Home</span>
        <span className="transform transition-transform duration-300 group-hover:translate-x-2">🏠</span>
      </a>
      
      <p className="mt-12 text-xs text-gray-500/80 tracking-widest uppercase font-bold animate-fade-in">
        Try <a href="/products" className="text-primary-400 hover:text-primary-300 underline">shopping</a> or contact support
      </p>
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