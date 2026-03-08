import api from "./api";
import { Order, OrdersResponse, CheckoutFormData, CartItem, OrderStats } from "../types";

export const orderService = {
  createOrder: async (
    formData: CheckoutFormData,
    cartItems: CartItem[]
  ): Promise<{ success: boolean; message: string; order: Order }> => {
    const products = cartItems.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      size: item.size,
      quantity: item.quantity,
    }));

    const response = await api.post("/orders", { ...formData, products });
    return response.data;
  },

  getOrders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<OrdersResponse> => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  getOrder: async (id: string): Promise<{ success: boolean; order: Order }> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (
    id: string,
    status: string
  ): Promise<{ success: boolean; order: Order }> => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },

  getOrderStats: async (): Promise<{ success: boolean; stats: OrderStats }> => {
    const response = await api.get("/orders/stats");
    return response.data;
  },
};