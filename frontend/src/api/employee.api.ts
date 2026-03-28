import api from "./axios";

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface EmployeeMe {
  user_id: string;
  company_id: string | null;
  department_id?: string | null;
  type?: string;
  roles: string[];
  priority?: string;
  name?: string | null;
  email?: string | null;
  username?: string | null;
  can_create_group?: boolean;
}

export interface EmployeeGoogleLoginRequest {
  id_token: string;
}

export interface EmployeePasswordLoginRequest {
  username: string;
  password: string;
}

export function employeeGoogleLogin(payload: EmployeeGoogleLoginRequest) {
  return api.post<LoginResponse>("/auth/employee/google-login", payload);
}

export function employeePasswordLogin(payload: EmployeePasswordLoginRequest) {
  return api.post<LoginResponse>("/auth/login/username-password", payload);
}

export function getEmployeeMe() {
  return api.get<EmployeeMe>("/auth/me");
}

export interface CompanyUser {
  user_id: string;
  email: string;
  name: string;
  display: string;
  username?: string | null;
}

export function getCompanyUsers() {
  return api.get<CompanyUser[]>("/auth/company-users");
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export function changePassword(payload: ChangePasswordPayload) {
  return api.post<{ message: string }>("/auth/change-password", payload);
}

export interface ChangeUsernamePayload {
  current_password: string;
  new_username: string;
}

export function changeUsername(payload: ChangeUsernamePayload) {
  return api.post<{ message: string; username: string }>(
    "/auth/change-username",
    payload,
  );
}

