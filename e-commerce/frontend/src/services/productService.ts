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
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await api.get("/products", { params });
        return response.data;
      } catch (error: any) {
        lastError = error;
        const isTimeoutOrNetworkError = 
          error.code === 'ECONNABORTED' || // timeout
          error.code === 'ENOTFOUND' ||
          error.code === 'ECONNRESET' ||
          !error.response; // network error

        if (!isTimeoutOrNetworkError || attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff: 100ms, 300ms, 900ms
        const delay = Math.min(100 * Math.pow(3, attempt - 1), 2000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  },

  getProduct: async (id: string): Promise<{ success: boolean; product: Product }> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async (): Promise<{ success: boolean; categories: string[] }> => {
    const response = await api.get("/products/categories");
    return response.data;
  },

  uploadImage: async (file: File): Promise<{ success: boolean; imageUrl: string; message: string }> => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await api.post("/products/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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

  createCategory: async (category: string): Promise<{ success: boolean; categories: string[]; message: string }> => {
    const response = await api.post("/products/categories", { category });
    return response.data;
  },

  deleteCategory: async (category: string): Promise<{ success: boolean; categories: string[]; message: string }> => {
    const response = await api.delete(`/products/categories/${encodeURIComponent(category)}`);
    return response.data;
  },
};
