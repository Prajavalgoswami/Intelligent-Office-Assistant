import api from "./axios";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const loginSuperAdmin = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post("/super-admin/login", {
    email,
    password,
  });
  return response.data;
};
