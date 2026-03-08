import React from "react";
import { Link } from "react-router-dom";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";

const CartSidebar: React.FC = () => {
  const { state, removeFromCart, updateQuantity, closeCart, totalPrice } = useCart();
  const { isOpen, items } = state;
  const shippingPrice = 50;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-dark-400">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-primary-500" size={22} />
            <h2 className="text-white font-semibold tracking-widest uppercase text-sm">
              Cart ({items.length} {items.length === 1 ? "item" : "items"})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <ShoppingBag size={60} className="text-gray-200 mb-6" />
              <h3 className="text-xl font-semibold text-dark-400 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 text-sm mb-8">
                Discover our exclusive streetwear collection
              </p>
              <Link
                to="/products"
                onClick={closeCart}
                className="bg-dark-400 text-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-primary-500 transition-colors duration-300"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {items.map((item, index) => (
                <div
                  key={`${item.product._id}-${item.size}-${index}`}
                  className="flex gap-4 pb-4 border-b border-gray-100 last:border-0"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-dark-400 text-sm leading-tight mb-1 truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">Size: {item.size}</p>
                    <p className="text-primary-600 font-bold text-sm mb-3">
                      EGP {item.product.price.toLocaleString()}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 border border-gray-200 rounded-full">
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.size, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center text-dark-400 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product._id, item.size, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center text-dark-400 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product._id, item.size)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 space-y-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>EGP {totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>EGP {shippingPrice}</span>
              </div>
              <div className="flex justify-between font-bold text-dark-400 text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary-600">
                  EGP {(totalPrice + shippingPrice).toLocaleString()}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="block w-full bg-dark-400 text-white text-center py-4 text-sm font-bold tracking-widest uppercase hover:bg-primary-500 transition-colors duration-300 rounded-none"
            >
              Proceed to Checkout
            </Link>

            <button
              onClick={closeCart}
              className="w-full text-center text-sm text-gray-500 hover:text-dark-400 transition-colors underline"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;