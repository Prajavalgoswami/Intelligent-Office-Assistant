import axios from "./axios";

// --- Types ---

export interface CompanyAdminLoginResponse {
  access_token: string;
  token_type: string;
  first_login: boolean;
}

export interface AdminMeResponse {
  user_id: string;
  company_id: string;
  email: string;
  name: string;
  first_login: boolean;
}

export interface Department {
  id: string;
  _id?: string;
  company_id: string;
  department_name: string;
  description?: string;
  is_default?: boolean;
  created_at?: string;
  member_count: number;
}

export interface Role {
  _id: string;
  role_name: string;
  description?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  is_system_role: boolean;
  permissions: string[];
}

export interface CreateDepartmentRequest {
  department_name: string; // Backend expects 'department_name', not 'name' based on schema
  description?: string;
}

export interface DepartmentMember {
  user_id: string;
  name: string;
  email: string;
  roles: string[];
}

export interface DepartmentMembersResponse {
  department: {
    id: string;
    department_name: string;
    description?: string;
  };
  members: DepartmentMember[];
}

export interface CreateRoleRequest {
  role_name: string;
  description?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface CreateUserRequest {
  username: string;
  name: string;
  email: string;
  department_id: string;
  role_ids: string[];
}

export interface CreateUserResponse {
  message: string;
  user_id: string;
  username?: string;
  temp_password?: string;
}

// --- API Functions ---

export const companyAdminGoogleLogin = (token: string) =>
  axios.post<CompanyAdminLoginResponse>("/company-admin/login/google", { token });

export const getCurrentAdmin = () =>
  axios.get<AdminMeResponse>("/company-admin/me");

export const getOnboardingStatus = () =>
  axios.get<{ completed: boolean }>("/company-admin/onboarding/status"); // Assuming this exists or returns simple status

export const completeOnboarding = (formData: FormData) =>
  axios.post("/company-admin/onboarding", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getDepartments = () =>
  axios.get<Department[]>("/company-admin/departments");

export const createDepartment = (payload: CreateDepartmentRequest) =>
  axios.post<{ message: string; department_id: string }>("/company-admin/departments", payload);

export const getDepartmentMembers = (departmentId: string) =>
  axios.get<DepartmentMembersResponse>(`/company-admin/departments/${departmentId}/members`);

export const getRoles = () =>
  axios.get<Role[]>("/company-admin/roles");

export const createRole = (payload: CreateRoleRequest) =>
  axios.post<{ message: string; role_id: string }>("/company-admin/roles", payload);

export const createUser = (payload: CreateUserRequest) =>
  axios.post<CreateUserResponse>("/company-admin/users", payload);
