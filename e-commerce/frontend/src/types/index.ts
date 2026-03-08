export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  sizes: string[];
  stock: number;
  category: string;
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  size: string;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  governorate: string;
  postalCode: string;
  products: OrderItem[];
  totalPrice: number;
  shippingPrice: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "customer";
  isVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  email?: string;
  requiresVerification?: boolean;
}

export interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  products: Product[];
}

export interface OrdersResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  orders: Order[];
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
}

export interface CheckoutFormData {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  governorate: string;
  postalCode: string;
  paymentMethod: string;
  notes: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  sizes: string[];
  stock: number;
  category: string;
  featured: boolean;
}