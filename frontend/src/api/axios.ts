import axios from "axios";
import { API_BASE_URL } from "../config/env";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const isCompanyAdminRoute = config.url?.startsWith("/company-admin");

  const token = isCompanyAdminRoute
    ? localStorage.getItem("company_admin_token")
    : localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isCompanyAdminRoute = error.config?.url?.startsWith("/company-admin");

    // Only 401 (unauthorized) logs out; 403 (forbidden) shows error without clearing session
    if (error.response?.status === 401) {
      if (isCompanyAdminRoute) {
        localStorage.removeItem("company_admin_token");
        window.location.href = "/company-admin/login";
      } else {
        localStorage.removeItem("access_token");
        const path = window.location.pathname;
        if (path.startsWith("/dashboard") || path.startsWith("/super-admin")) {
          window.location.href = "/super-admin/login";
        } else {
          window.location.href = "/employee-login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
