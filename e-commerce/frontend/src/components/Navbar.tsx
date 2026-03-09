import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { totalItems, toggleCart } = useCart();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";
  const isTransparent = isHomePage && !isScrolled && !isMobileMenuOpen;

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowDropdown(false);
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  const navLinks: { to?: string; href?: string; label: string }[] = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
    { href: "#about", label: "About" },
    { href: "#reviews", label: "Reviews" },
  ];

  // Check if link is a hash link
  const isHashLink = (link: { href?: string; to?: string }) => !!link.href;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? "bg-transparent"
            : "bg-dark-400 shadow-2xl border-b border-white/10"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ── Logo ── */}
            <Link to="/" className="flex flex-col items-start group flex-shrink-0">
              <span className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white group-hover:text-primary-500 transition-colors duration-300">
                URBAN
              </span>
              <span className="text-xs tracking-[0.5em] text-primary-500 -mt-1 font-light">
                NILE
              </span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                isHashLink(link) ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${
                         location.pathname === link.to
       ? "text-primary-500"
       : "text-gray-300 hover:text-white"
   }`}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to!}
                    className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${
                      location.pathname === link.to
                        ? "text-primary-500"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>

            {/* ── Right Actions ── */}
            <div className="flex items-center space-x-3 md:space-x-4">

              {/* Search — Desktop */}
              {showSearch ? (
                <form
                  onSubmit={handleSearch}
                  className="hidden md:flex items-center gap-2"
                >
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-2 rounded-full text-sm focus:outline-none focus:border-primary-500 w-44 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={17} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="hidden md:flex text-gray-300 hover:text-white transition-colors p-1"
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
              )}

              {/* ── User Account ── */}
              {isLoggedIn && user ? (
                /* Logged-in dropdown */
                <div ref={dropdownRef} className="relative hidden md:block">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 group"
                    aria-label="Account menu"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-dark-400 font-bold text-xs flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary-500/50 transition-all">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-300 text-sm max-w-[90px] truncate hidden lg:block">
                      {user.name.split(" ")[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform duration-200 ${
                        showDropdown ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute top-full right-0 mt-3 w-52 bg-white shadow-2xl border border-gray-100 z-50 animate-fade-in">
                      {/* User Info */}
                      <div className="bg-dark-400 px-4 py-3">
                        <p className="text-white text-xs font-bold truncate">
                          {user.name}
                        </p>
                        <p className="text-gray-400 text-[11px] truncate mt-0.5">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1.5 text-[10px] bg-primary-500/20 text-primary-400 px-2 py-0.5 font-bold tracking-wider uppercase">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        {/* My Orders — only for customers */}
                        {!isAdmin && (
                          <Link
                            to="/my-orders"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-dark-400 hover:bg-gray-50 hover:text-primary-600 transition-colors font-medium"
                          >
                            <Package size={15} className="text-gray-400" />
                            My Orders
                          </Link>
                        )}

                        {/* Admin Dashboard */}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-dark-400 hover:bg-gray-50 hover:text-primary-600 transition-colors font-medium"
                          >
                            <LayoutDashboard size={15} className="text-gray-400" />
                            Admin Dashboard
                          </Link>
                        )}

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
                          >
                            <LogOut size={15} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Not logged in → Login button */
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
                  aria-label="Login"
                >
                  <User size={20} />
                  <span className="hidden lg:inline tracking-wider text-xs uppercase">
                    Login
                  </span>
                </Link>
              )}

              {/* ── Cart Button ── */}
              <button
                onClick={toggleCart}
                className="relative flex items-center text-gray-300 hover:text-white transition-colors p-1"
                aria-label={`Cart (${totalItems} items)`}
              >
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-500 text-dark-400 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>

              {/* ── Mobile Menu Toggle ── */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-300 hover:text-white transition-colors p-1"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-dark-400 border-t border-white/10 animate-slide-up">
            <div className="px-4 py-5 space-y-1">

              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-400 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 rounded-full"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-primary-500 text-dark-400 px-4 py-2.5 text-xs font-bold rounded-full"
                >
                  Go
                </button>
              </form>

              {/* Nav Links */}
              {navLinks.map((link) => (
                isHashLink(link) ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block text-sm font-medium tracking-widest uppercase py-3 px-2 border-b border-white/5 transition-colors text-gray-300 hover:text-white"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to!}
                    className={`block text-sm font-medium tracking-widest uppercase py-3 px-2 border-b border-white/5 transition-colors ${
                      location.pathname === link.to
                        ? "text-primary-500"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              ))}

              {/* Mobile Auth Section */}
              <div className="pt-4 space-y-2">
                {isLoggedIn && user ? (
                  <>
                    {/* User Info Card */}
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 mb-3">
                      <div className="w-9 h-9 bg-primary-500 rounded-full flex items-center justify-center text-dark-400 font-bold text-sm flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">
                          {user.name}
                        </p>
                        <p className="text-gray-400 text-xs truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* My Orders */}
                    {!isAdmin && (
                      <Link
                        to="/my-orders"
                        className="flex items-center gap-3 text-gray-300 hover:text-white text-sm font-medium tracking-wider uppercase py-3 px-2 border-b border-white/5 transition-colors"
                      >
                        <Package size={16} className="text-primary-500" />
                        My Orders
                      </Link>
                    )}

                    {/* Admin Dashboard */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 text-gray-300 hover:text-white text-sm font-medium tracking-wider uppercase py-3 px-2 border-b border-white/5 transition-colors"
                      >
                        <LayoutDashboard size={16} className="text-primary-500" />
                        Admin Dashboard
                      </Link>
                    )}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 text-sm font-medium tracking-wider uppercase py-3 px-2 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center justify-center gap-2 w-full bg-primary-500 text-dark-400 py-3 text-sm font-bold tracking-widest uppercase hover:bg-primary-400 transition-colors"
                    >
                      <User size={16} />
                      Login / Register
                    </Link>
                    <Link
                      to="/admin/login"
                      className="flex items-center justify-center w-full border border-white/20 text-gray-400 py-3 text-xs font-medium tracking-widest uppercase hover:border-white/40 hover:text-white transition-colors"
                    >
                      Admin Panel
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;