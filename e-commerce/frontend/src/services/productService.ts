import api from "./api";
import { Product, ProductsResponse, ProductFormData } from "../types";

interface GetProductsParams {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sortBy?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const productService = {
  getProducts: async (params?: GetProductsParams): Promise<ProductsResponse> => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  getProduct: async (id: string): Promise<{ success: boolean; product: Product }> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<{ success: boolean; categories: string[] }> => {
    const response = await api.get("/products/categories");
    return response.data;
  },

  createProduct: async (data: ProductFormData): Promise<{ success: boolean; product: Product }> => {
    const response = await api.post("/products", data);
    return response.data;
  },

  updateProduct: async (
    id: string,
    data: Partial<ProductFormData>
  ): Promise<{ success: boolean; product: Product }> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};