import { Routes, Route, Navigate } from "react-router-dom";

/* Super Admin */
import Login from "../pages/super-admin/Login";
import Dashboard from "../pages/super-admin/Dashboard";
import CreateCompany from "../pages/super-admin/CreateCompany";
import AppLayout from "../layouts/AppLayout";
import RequireSuperAdmin from "../auth/RequireSuperAdmin";

/* Company Admin */
import { AdminLoginPage } from "../pages/company-admin/Login";
import { CompanyAdminDashboard } from "../pages/company-admin/Dashboard";
import { CompanyOnboardingPage } from "../pages/company-admin/Onboarding";
import { Departments } from "../pages/company-admin/Departments";
import { Roles } from "../pages/company-admin/Roles";
import { Users } from "../pages/company-admin/Users";
import { DashboardLayoutWithOutlet } from "../layouts/DashboardLayoutWithOutlet";
import CompanyAdminGuard from "../auth/CompanyAdminGuard";
import OnboardingGuard from "../auth/OnboardingGuard";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Entry */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* SUPER ADMIN */}
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <RequireSuperAdmin>
            <AppLayout />
          </RequireSuperAdmin>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="create-company" element={<CreateCompany />} />
      </Route>

      {/* COMPANY ADMIN */}
      <Route path="/company-admin/login" element={<AdminLoginPage />} />

      <Route path="/company-admin" element={<CompanyAdminGuard />}>
        <Route element={<OnboardingGuard />}>
          <Route path="onboarding" element={<CompanyOnboardingPage />} />
        </Route>
        <Route element={<DashboardLayoutWithOutlet />}>
          <Route index element={<CompanyAdminDashboard />} />
          <Route path="departments" element={<Departments />} />
          <Route path="roles" element={<Roles />} />
          <Route path="users" element={<Users />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
