import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartPage: React.FC = () => {
  const { state, removeFromCart, updateQuantity, totalPrice } = useCart();
  const { items } = state;
  const navigate = useNavigate();
  const shippingPrice = totalPrice >= 800 ? 0 : 50;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="text-center animate-fade-in">
          <div className="w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={52} className="text-gray-300" />
          </div>
          <h2 className="text-3xl font-bold text-dark-400 mb-3 tracking-wider">
            YOUR CART IS EMPTY
          </h2>
          <p className="text-gray-500 text-sm mb-10 max-w-xs mx-auto leading-relaxed">
            Looks like you haven't added anything yet. Explore our exclusive
            streetwear collection.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-3 bg-dark-400 text-white px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors duration-300 group"
          >
            Browse Products
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Page Header */}
      <div className="bg-dark-400 py-12 text-center">
        <p className="text-primary-500 text-xs tracking-[0.4em] uppercase font-semibold mb-2">
          Review Your Order
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
          SHOPPING CART
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          {items.length} {items.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Free Shipping Banner */}
        {totalPrice < 800 && (
          <div className="bg-primary-500/10 border border-primary-500/30 text-primary-700 px-5 py-3 mb-6 flex items-center gap-3 rounded-none text-sm font-medium">
            <Tag size={16} className="text-primary-500 flex-shrink-0" />
            <span>
              Add{" "}
              <strong>EGP {(800 - totalPrice).toLocaleString()}</strong> more
              to unlock <strong>Free Shipping!</strong>
            </span>
          </div>
        )}
        {totalPrice >= 800 && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-3 mb-6 flex items-center gap-3 text-sm font-medium">
            <span>🎉</span>
            <span>
              Congratulations! You've unlocked{" "}
              <strong>Free Shipping</strong>.
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Cart Items ── */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => (
              <div
                key={`${item.product._id}-${item.size}-${idx}`}
                className="bg-white p-5 flex gap-5 shadow-sm border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
              >
                {/* Product Image */}
                <Link
                  to={`/products/${item.product._id}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-24 h-28 md:w-32 md:h-36 object-cover hover:opacity-80 transition-opacity"
                  />
                </Link>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <div>
                      <p className="text-xs text-primary-500 font-bold tracking-widest uppercase mb-1">
                        {item.product.category}
                      </p>
                      <Link to={`/products/${item.product._id}`}>
                        <h3 className="font-bold text-dark-400 text-base leading-tight hover:text-primary-600 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                    </div>
                    <button
                      onClick={() =>
                        removeFromCart(item.product._id, item.size)
                      }
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                      title="Remove item"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 mt-2">
                    <span>
                      Size:{" "}
                      <span className="font-semibold text-dark-400 border border-gray-200 px-2 py-0.5 text-xs ml-1">
                        {item.size}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center border-2 border-gray-100 hover:border-dark-400 transition-colors">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.size,
                            item.quantity - 1
                          )
                        }
                        className="w-9 h-9 flex items-center justify-center text-dark-400 hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-10 text-center font-bold text-dark-400 text-sm select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.size,
                            item.quantity + 1
                          )
                        }
                        disabled={item.quantity >= item.product.stock}
                        className="w-9 h-9 flex items-center justify-center text-dark-400 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Line Price */}
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-0.5">
                        EGP {item.product.price.toLocaleString()} × {item.quantity}
                      </p>
                      <p className="font-bold text-dark-400 text-lg leading-none">
                        EGP{" "}
                        {(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-dark-400 transition-colors font-medium"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-sm border border-gray-100 sticky top-24">
              {/* Summary Header */}
              <div className="bg-dark-400 px-6 py-4">
                <h2 className="text-sm font-bold text-white tracking-[0.25em] uppercase">
                  Order Summary
                </h2>
              </div>

              <div className="p-6">
                {/* Line Items */}
                <div className="space-y-3 mb-4">
                  {items.map((item, idx) => (
                    <div
                      key={`summary-${item.product._id}-${item.size}-${idx}`}
                      className="flex justify-between text-xs text-gray-500"
                    >
                      <span className="truncate max-w-[160px]">
                        {item.product.name}{" "}
                        <span className="text-gray-400">
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="font-medium text-dark-400 ml-2 flex-shrink-0">
                        EGP {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      EGP {totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span
                      className={
                        shippingPrice === 0
                          ? "text-green-600 font-semibold"
                          : "font-medium"
                      }
                    >
                      {shippingPrice === 0
                        ? "FREE"
                        : `EGP ${shippingPrice}`}
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="border-t-2 border-dark-400 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-dark-400 text-base tracking-wider uppercase">
                      Total
                    </span>
                    <span className="font-bold text-primary-600 text-2xl">
                      EGP {(totalPrice + shippingPrice).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    VAT included where applicable
                  </p>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-dark-400 text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors duration-300 flex items-center justify-center gap-3 group mb-3"
                >
                  Proceed to Checkout
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                {/* Security Note */}
                <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                  <span>🔒</span> Secure & encrypted checkout
                </p>

                {/* Payment Icons */}
                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <p className="text-xs text-gray-400 mb-2">
                    We Accept
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {["Cash on Delivery", "Visa", "MasterCard"].map(
                      (method) => (
                        <span
                          key={method}
                          className="text-xs border border-gray-200 px-2 py-1 text-gray-500 bg-gray-50"
                        >
                          {method}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;