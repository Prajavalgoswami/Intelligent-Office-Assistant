import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const isCompanyAdminRoute =
    config.url?.startsWith("/company-admin");

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
    const isCompanyAdminRoute =
      error.config?.url?.startsWith("/company-admin");

    if (error.response?.status === 401 || error.response?.status === 403) {
      if (isCompanyAdminRoute) {
        localStorage.removeItem("company_admin_token");
        window.location.href = "/company-admin/login";
      } else {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
