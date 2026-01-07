import axios from "./axiosInstance";

export const superAdminLogin = (data) =>
  axios.post("/super-admin/login", data);

export const createCompany = (data) =>
  axios.post("/super-admin/companies", data);
