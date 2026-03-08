import api from "./api";
import { AuthResponse, User } from "../types";

export const authService = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  verifyOTP: async (data: {
    email: string;
    otp: string;
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/verify-otp", data);
    return response.data;
  },

  resendOTP: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (data: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem("urban_nile_token");
    localStorage.removeItem("urban_nile_user");
  },

  getStoredUser: (): User | null => {
    const user = localStorage.getItem("urban_nile_user");
    return user ? JSON.parse(user) : null;
  },

  getToken: (): string | null => {
    return localStorage.getItem("urban_nile_token");
  },

  storeAuth: (token: string, user: User): void => {
    localStorage.setItem("urban_nile_token", token);
    localStorage.setItem("urban_nile_user", JSON.stringify(user));
  },
};