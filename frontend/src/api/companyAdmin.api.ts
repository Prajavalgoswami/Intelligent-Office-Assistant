import axios from "./axios"

export const companyAdminGoogleLogin = (token: string) =>
  axios.post("/company-admin/login/google", { token })

export const getCurrentAdmin = () =>
  axios.get("/company-admin/me")

export const getOnboardingStatus = () =>
  axios.get("/company-admin/onboarding/status")

export const completeOnboarding = (formData: FormData) =>
  axios.post("/company-admin/onboarding", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })

export const getDepartments = () =>
  axios.get("/company-admin/departments")

export const createDepartment = (payload: any) =>
  axios.post("/company-admin/departments", payload)

export const getRoles = () =>
  axios.get("/company-admin/roles")

export const createRole = (payload: any) =>
  axios.post("/company-admin/roles", payload)

export const createUser = (payload: any) =>
  axios.post("/company-admin/users", payload)
