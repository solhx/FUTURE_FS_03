import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Menu, X, Search, User } from "lucide-react";
import { useCart } from "../context/CartContext";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { totalItems, toggleCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
    { to: "/#about", label: "About" },
    { to: "/#reviews", label: "Reviews" },
  ];

  const isTransparent = isHomePage && !isScrolled && !isMobileMenuOpen;

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
            {/* Logo */}
            <Link
              to="/"
              className="flex flex-col items-start group"
            >
              <span className="text-xl md:text-2xl font-bold tracking-[0.2em] text-white group-hover:text-primary-500 transition-colors duration-300">
                URBAN
              </span>
              <span className="text-xs tracking-[0.5em] text-primary-500 -mt-1 font-light">
                NILE
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium tracking-widest uppercase transition-colors duration-300 ${
                    location.pathname === link.to
                      ? "text-primary-500"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              {showSearch ? (
                <form onSubmit={handleSearch} className="hidden md:flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-2 rounded-full text-sm focus:outline-none focus:border-primary-500 w-48 transition-all"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="hidden md:flex text-gray-300 hover:text-white transition-colors"
                >
                  <Search size={20} />
                </button>
              )}

              {/* Admin Link */}
              <Link
                to="/admin/login"
                className="hidden md:flex text-gray-300 hover:text-white transition-colors"
              >
                <User size={20} />
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ShoppingBag size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-300 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-dark-400 border-t border-white/10">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-white/10 border border-white/20 text-white placeholder-gray-400 px-4 py-2 rounded-full text-sm focus:outline-none focus:border-primary-500"
                />
                <button type="submit" className="text-primary-500">
                  <Search size={20} />
                </button>
              </form>

              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-gray-300 hover:text-white text-sm font-medium tracking-widest uppercase py-2 border-b border-white/5"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin/login"
                className="block text-gray-300 hover:text-white text-sm font-medium tracking-widest uppercase py-2"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;