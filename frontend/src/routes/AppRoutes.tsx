import { Routes, Route, Navigate } from "react-router-dom";

/* Super Admin */
import Login from "../pages/super-admin/Login";
import Dashboard from "../pages/super-admin/Dashboard";
import CreateCompany from "../pages/super-admin/CreateCompany";
import AppLayout from "../layouts/AppLayout";
import RequireSuperAdmin from "../auth/RequireSuperAdmin";

/* Company Admin */
import { AdminLoginPage } from "../pages/company-admin/Login";
import {CompanyAdminDashboard} from "../pages/company-admin/Dashboard";
import {CompanyOnboardingPage} from "../pages/company-admin/Onboarding";
import CompanyAdminLayout from "../layouts/AppLayout";
import CompanyAdminGuard from "../auth/CompanyAdminGuard";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Entry */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      /* ---------------- SUPER ADMIN ---------------- */

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

      /* ---------------- COMPANY ADMIN ---------------- */

      <Route path="/company-admin/login" element={<AdminLoginPage />} />

      <Route path="/company-admin" element={<CompanyAdminGuard />}>
      <Route element={<CompanyAdminLayout />}>
      <Route index element={<CompanyAdminDashboard />} />
      <Route path="onboarding" element={<CompanyOnboardingPage />} />
      </Route>

      <Route index element={<CompanyAdminDashboard />} />
      <Route path="onboarding" element={<CompanyOnboardingPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
