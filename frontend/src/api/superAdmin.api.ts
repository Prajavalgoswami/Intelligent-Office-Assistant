import api from "./axios";

export interface CreateCompanyPayload {
  company_name: string;
  company_domain: string;
  company_admin_email: string;
  enabled_features: string[];
}

export interface CreateCompanyResponse {
  company_id: string;
  company_admin_email: string;
  temporary_password: string;
  message: string;
}

export const createCompany = async (
  payload: CreateCompanyPayload
): Promise<CreateCompanyResponse> => {
  const { data } = await api.post("/super-admin/companies", payload);
  return data;
};
