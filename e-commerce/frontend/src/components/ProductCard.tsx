import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Star, Eye } from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, openCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const defaultSize = product.sizes[1] || product.sizes[0];
    addToCart(product, defaultSize, 1);
    openCart();
  };

  return (
    <div className="group relative bg-white overflow-hidden rounded-none border border-gray-100 hover:border-gray-300 hover:shadow-xl transition-all duration-500">
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <span className="bg-primary-500 text-white text-xs px-3 py-1 font-semibold tracking-wider uppercase">
              Featured
            </span>
          )}
          {product.stock < 10 && product.stock > 0 && (
            <span className="bg-red-500 text-white text-xs px-3 py-1 font-semibold">
              Low Stock
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-800 text-white text-xs px-3 py-1 font-semibold">
              Sold Out
            </span>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link
            to={`/products/${product._id}`}
            className="bg-white text-dark-400 p-3 rounded-full hover:bg-primary-500 hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
            style={{ transitionDelay: "50ms" }}
          >
            <Eye size={18} />
          </Link>
          {product.stock > 0 && (
            <button
              onClick={handleQuickAdd}
              className="bg-white text-dark-400 p-3 rounded-full hover:bg-primary-500 hover:text-white transition-all duration-300 transform translate-y-4 group-hover:translate-y-0"
              style={{ transitionDelay: "100ms" }}
            >
              <ShoppingBag size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-primary-500 font-semibold tracking-widest uppercase mb-1">
          {product.category}
        </p>

        {/* Name */}
        <h3 className="font-semibold text-dark-400 text-sm mb-2 leading-tight line-clamp-1">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-500 text-xs mb-3 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Rating */}
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={11}
                className={
                  i < Math.floor(product.rating)
                    ? "text-primary-500 fill-current"
                    : "text-gray-300 fill-current"
                }
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
          </div>
        )}

        {/* Sizes */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="text-xs border border-gray-200 px-2 py-0.5 text-gray-600 hover:border-dark-400 hover:text-dark-400 transition-colors cursor-pointer"
            >
              {size}
            </span>
          ))}
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-dark-400 text-lg">
            EGP {product.price.toLocaleString()}
          </span>
          <Link
            to={`/products/${product._id}`}
            className="text-xs font-bold tracking-widest uppercase bg-dark-400 text-white px-4 py-2 hover:bg-primary-500 transition-colors duration-300"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;