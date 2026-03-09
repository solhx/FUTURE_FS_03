import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Search, ChevronDown } from "lucide-react";
import { productService } from "../services/productService";
import { Product } from "../types";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";

const CATEGORIES = ["All", "T-Shirts", "Hoodies", "Joggers", "Jackets", "Sets", "Accessories"];
const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Top Rated" },
];

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = Number(searchParams.get("page") || 1);
  const currentCategory = searchParams.get("category") || "All";
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "createdAt-desc";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, order] = currentSort.split("-") as [string, "asc" | "desc"];
      const data = await productService.getProducts({
        search: currentSearch || undefined,
        category: currentCategory !== "All" ? currentCategory : undefined,
        minPrice: currentMinPrice ? Number(currentMinPrice) : undefined,
        maxPrice: currentMaxPrice ? Number(currentMaxPrice) : undefined,
        sortBy,
        order,
        page: currentPage,
        limit: 12,
      });
      setProducts(data.products);
      setTotalProducts(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentCategory, currentMinPrice, currentMaxPrice, currentSort, currentPage]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchProducts]);

  const updateParam = (key: string, value: string, resetPage = true) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "All") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when changing filters (search, category, sort, price), but not when changing pages
    if (resetPage) {
      params.delete("page");
    }
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam("search", searchInput);
  };

  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (minPriceInput) params.set("minPrice", minPriceInput);
    else params.delete("minPrice");
    if (maxPriceInput) params.set("maxPrice", maxPriceInput);
    else params.delete("maxPrice");
    params.delete("page");
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setSearchParams({});
  };

  const hasActiveFilters =
    currentSearch || currentCategory !== "All" || currentMinPrice || currentMaxPrice;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Page Header */}
      <div className="bg-dark-400 py-16 text-center">
        <p className="text-primary-500 text-xs tracking-[0.4em] uppercase font-semibold mb-3">
          Urban Nile Collection
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wider mb-2">
          ALL PRODUCTS
        </h1>
        <p className="text-gray-400 text-sm">
          {totalProducts} {totalProducts === 1 ? "product" : "products"} available
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="bg-white shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 text-sm focus:outline-none focus:border-dark-400 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="bg-dark-400 text-white px-6 py-2.5 text-sm font-semibold hover:bg-primary-500 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Sort */}
            <div className="relative">
              <select
                value={currentSort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="appearance-none bg-white border border-gray-200 px-4 py-2.5 pr-8 text-sm text-dark-400 focus:outline-none focus:border-dark-400 cursor-pointer w-full md:w-auto"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 border px-5 py-2.5 text-sm font-semibold transition-colors ${
                showFilters || hasActiveFilters
                  ? "bg-dark-400 text-white border-dark-400"
                  : "border-gray-200 text-dark-400 hover:border-dark-400"
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Price Range */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 tracking-wider uppercase mb-2">
                  Price Range (EGP)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-dark-400"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-dark-400"
                  />
                  <button
                    onClick={handlePriceFilter}
                    className="bg-dark-400 text-white px-4 py-2 text-sm hover:bg-primary-500 transition-colors whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-semibold transition-colors"
                  >
                    <X size={14} />
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => updateParam("category", cat)}
              className={`px-5 py-2 text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                currentCategory === cat
                  ? "bg-dark-400 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-dark-400 hover:text-dark-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {currentSearch && (
              <span className="flex items-center gap-1 bg-dark-400 text-white text-xs px-3 py-1.5 rounded-full">
                Search: {currentSearch}
                <button onClick={() => updateParam("search", "")}>
                  <X size={12} className="ml-1" />
                </button>
              </span>
            )}
            {currentMinPrice && (
              <span className="flex items-center gap-1 bg-dark-400 text-white text-xs px-3 py-1.5 rounded-full">
                Min: EGP {currentMinPrice}
                <button onClick={() => { setMinPriceInput(""); updateParam("minPrice", ""); }}>
                  <X size={12} className="ml-1" />
                </button>
              </span>
            )}
            {currentMaxPrice && (
              <span className="flex items-center gap-1 bg-dark-400 text-white text-xs px-3 py-1.5 rounded-full">
                Max: EGP {currentMaxPrice}
                <button onClick={() => { setMaxPriceInput(""); updateParam("maxPrice", ""); }}>
                  <X size={12} className="ml-1" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <LoadingSpinner size="md" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-dark-400 mb-2">No Products Found</h3>
            <p className="text-gray-500 text-sm mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearAllFilters}
              className="bg-dark-400 text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => updateParam("page", String(currentPage - 1), false)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 border border-gray-200 flex items-center justify-center text-dark-400 hover:bg-dark-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => updateParam("page", String(i + 1), false)}
                    className={`w-10 h-10 border text-sm font-semibold transition-colors ${
                      currentPage === i + 1
                        ? "bg-dark-400 text-white border-dark-400"
                        : "border-gray-200 text-dark-400 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => updateParam("page", String(currentPage + 1), false)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 border border-gray-200 flex items-center justify-center text-dark-400 hover:bg-dark-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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

export default ProductsPage;