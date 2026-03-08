import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { CartItem, Product } from "../types";
import toast from "react-hot-toast";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: { product: Product; size: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: { productId: string; size: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; size: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" };

interface CartContextType {
  state: CartState;
  addToCart: (product: Product, size: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const { product, size, quantity } = action.payload;
      const existingIndex = state.items.findIndex(
        (item) => item.product._id === product._id && item.size === size
      );

      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + quantity,
        };
        return { ...state, items: updatedItems };
      }

      return {
        ...state,
        items: [...state.items, { product, size, quantity }],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(item.product._id === action.payload.productId && item.size === action.payload.size)
        ),
      };

    case "UPDATE_QUANTITY": {
      const { productId, size, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) => !(item.product._id === productId && item.size === size)
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.product._id === productId && item.size === size
            ? { ...item, quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    case "OPEN_CART":
      return { ...state, isOpen: true };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    default:
      return state;
  }
};

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem("urban_nile_cart");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: loadCartFromStorage(),
    isOpen: false,
  });

  useEffect(() => {
    localStorage.setItem("urban_nile_cart", JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product: Product, size: string, quantity: number) => {
    dispatch({ type: "ADD_ITEM", payload: { product, size, quantity } });
    toast.success(`${product.name} added to cart!`, {
      icon: "🛍️",
      style: { background: "#1a1a1a", color: "#fff", border: "1px solid #c9a96e" },
    });
  };

  const removeFromCart = (productId: string, size: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId, size } });
    toast.success("Item removed from cart", {
      icon: "🗑️",
      style: { background: "#1a1a1a", color: "#fff" },
    });
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { productId, size, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const toggleCart = () => dispatch({ type: "TOGGLE_CART" });
  const openCart = () => dispatch({ type: "OPEN_CART" });
  const closeCart = () => dispatch({ type: "CLOSE_CART" });

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};