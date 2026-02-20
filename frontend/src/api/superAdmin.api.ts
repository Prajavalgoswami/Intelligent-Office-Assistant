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

export interface DashboardStats {
  total_companies: number;
  active_companies: number;
  total_users: number;
  active_users: number;
  recent_companies: Array<{
    id: string;
    name: string;
    domain: string;
    created_at: string;
  }>;
  growth_data: Array<{
    date: string;
    count: number;
  }>;
  platform_health: string;
}

export const createCompany = async (
  payload: CreateCompanyPayload
): Promise<CreateCompanyResponse> => {
  const { data } = await api.post("/super-admin/companies", payload);
  return data;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get("/super-admin/dashboard/stats");
  return data;
};
