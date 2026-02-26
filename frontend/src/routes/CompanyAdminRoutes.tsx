import { Routes, Route, Navigate } from "react-router-dom"
import CompanyAdminGuard from "../auth/CompanyAdminGuard"

import { AdminLoginPage } from "../pages/company-admin/Login"
import { CompanyOnboardingPage } from "../pages/company-admin/Onboarding"
import { CompanyAdminDashboard } from "../pages/company-admin/Dashboard"
import { Departments } from "../pages/company-admin/Departments"
import { Roles } from "../pages/company-admin/Roles"
import { Users } from "../pages/company-admin/Users"

export default function CompanyAdminRoutes() {
  return (
    <Routes>
      <Route path="/company-admin/login" element={<AdminLoginPage />} />

      <Route element={<CompanyAdminGuard />}>
        <Route path="/company-admin/onboarding" element={<CompanyOnboardingPage />} />
        <Route path="/company-admin" element={<CompanyAdminDashboard />} />
        <Route path="/company-admin/departments" element={<Departments />} />
        <Route path="/company-admin/roles" element={<Roles />} />
        <Route path="/company-admin/users" element={<Users />} />
      </Route>

      <Route path="*" element={<Navigate to="/company-admin/login" />} />
    </Routes>
  )
}
