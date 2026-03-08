import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingBag,
  Zap,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  RotateCcw,
  Shield,
  Plus,
  Minus,
} from "lucide-react";
import { productService } from "../services/productService";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, openCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await productService.getProduct(id);
        setProduct(data.product);
        setSelectedSize(data.product.sizes[1] || data.product.sizes[0]);

        const related = await productService.getProducts({
          category: data.product.category,
          limit: 4,
        });
        setRelatedProducts(related.products.filter((p) => p._id !== id).slice(0, 4));
      } catch {
        navigate("/products");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) return <LoadingSpinner size="lg" fullScreen />;
  if (!product) return null;

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart(product, selectedSize, quantity);
    openCart();
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart(product, selectedSize, quantity);
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-dark-400 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/products" className="hover:text-dark-400 transition-colors">
            Products
          </Link>
          <span>/</span>
          <Link
            to={`/products?category=${product.category}`}
            className="hover:text-dark-400 transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-dark-400 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
          {/* ── Images ── */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden group">
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              {/* Stock Badge */}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-bold text-xl tracking-widest uppercase">
                    Sold Out
                  </span>
                </div>
              )}
              {/* Image Nav */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        (prev) => (prev - 1 + allImages.length) % allImages.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) => (prev + 1) % allImages.length)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden border-2 transition-all ${
                      selectedImage === i
                        ? "border-dark-400"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="lg:py-4">
            {/* Category & Badge */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-primary-500 font-bold tracking-widest uppercase">
                {product.category}
              </span>
              {product.featured && (
                <span className="bg-primary-500 text-dark-400 text-xs px-3 py-1 font-bold tracking-wider">
                  Featured
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-dark-400 tracking-wide mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.floor(product.rating)
                          ? "text-primary-500 fill-current"
                          : "text-gray-300 fill-current"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-dark-400">
                EGP {product.price.toLocaleString()}
              </span>
            </div>

            <div className="w-full h-px bg-gray-100 mb-6" />

            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-8 text-sm md:text-base">
              {product.description}
            </p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <Package size={16} className="text-gray-400" />
              {product.stock > 10 ? (
                <span className="text-green-600 text-sm font-semibold">
                  ✓ In Stock ({product.stock} available)
                </span>
              ) : product.stock > 0 ? (
                <span className="text-orange-500 text-sm font-semibold">
                  ⚠ Only {product.stock} left!
                </span>
              ) : (
                <span className="text-red-500 text-sm font-semibold">
                  ✗ Out of Stock
                </span>
              )}
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-dark-400 tracking-widest uppercase">
                  Select Size
                </label>
                <button className="text-xs text-primary-500 underline">Size Guide</button>
              </div>
              <div className="flex gap-3 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[50px] h-12 border-2 text-sm font-bold transition-all duration-300 ${
                      selectedSize === size
                        ? "border-dark-400 bg-dark-400 text-white"
                        : "border-gray-200 text-gray-600 hover:border-dark-400 hover:text-dark-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-red-500 text-xs mt-2">Please select a size</p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-xs font-bold text-dark-400 tracking-widest uppercase mb-3">
                Quantity
              </label>
              <div className="flex items-center border-2 border-gray-200 w-fit">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-12 h-12 flex items-center justify-center text-dark-400 hover:bg-gray-100 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-14 text-center font-bold text-lg text-dark-400">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  disabled={quantity >= product.stock}
                  className="w-12 h-12 flex items-center justify-center text-dark-400 hover:bg-gray-100 transition-colors disabled:opacity-30"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-3 border-2 border-dark-400 text-dark-400 py-4 text-sm font-bold tracking-widest uppercase hover:bg-dark-400 hover:text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-3 bg-primary-500 text-dark-400 py-4 text-sm font-bold tracking-widest uppercase hover:bg-dark-300 hover:text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Zap size={18} />
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { Icon: Truck, text: "Free Shipping Over EGP 800" },
                { Icon: Shield, text: "Premium Quality Guarantee" },
                { Icon: RotateCcw, text: "30-Day Easy Returns" },
                { Icon: Package, text: "Secure Packaging" },
              ].map(({ Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 bg-gray-50 p-3"
                >
                  <Icon size={14} className="text-primary-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <div className="text-center mb-10">
              <p className="text-primary-500 text-xs tracking-[0.4em] uppercase font-semibold mb-3">
                You May Also Like
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-dark-400 tracking-wider">
                RELATED PRODUCTS
              </h2>
              <div className="w-12 h-0.5 bg-primary-500 mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <div
                  key={p._id}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                    navigate(`/products/${p._id}`);
                  }}
                  className="cursor-pointer"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;