import axios from "axios";
import type { AuthUser } from "../types";

// Relative "/api" base works in dev (via Vite proxy) and in Docker (via nginx proxy).
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("auth_user");
  if (stored) {
    try {
      const user: AuthUser = JSON.parse(stored);
      config.headers.Authorization = `Bearer ${user.token}`;
    } catch {
      /* ignore */
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
