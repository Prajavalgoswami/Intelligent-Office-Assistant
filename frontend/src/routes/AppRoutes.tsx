import { Routes, Route, Navigate } from "react-router-dom";

/* Super Admin */
import Login from "../pages/super-admin/Login";
import Dashboard from "../pages/super-admin/Dashboard";
import CreateCompany from "../pages/super-admin/CreateCompany";
import AppLayout from "../layouts/AppLayout";
import RequireSuperAdmin from "../auth/RequireSuperAdmin";
import { EmployeeLogin } from "../pages/employee/Login";
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
import EmployeeGuard from "../auth/EmployeeGuard";
import { EmployeeAppLayout } from "../layouts/EmployeeAppLayout";
import { EmployeeDashboard } from "../pages/employee/Dashboard";
import { TodayTasksPage } from "../pages/employee/TodayTasksPage";
import { ServiceRequestsPage } from "../pages/service-requests/ServiceRequestsPage";
import { ChatPage } from "../pages/chat/ChatPage";
import { BroadcastPage } from "../pages/broadcast/BroadcastPage";
import { ConversationPage } from "../pages/conversation/ConversationPage";
import { GmailPage } from "../pages/gmail/GmailPage";
import { DocumentsPage } from "../pages/documents/DocumentsPage";
import { NotificationProvider } from "../context/NotificationContext";
import { ProfilePage } from "../pages/employee/ProfilePage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Entry → employee login by default */}
      <Route path="/" element={<Navigate to="/employee-login" replace />} />

      {/* SUPER ADMIN */}
      <Route path="/super-admin/login" element={<Login />} />
      <Route path="/login" element={<Navigate to="/super-admin/login" replace />} />

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

      {/* EMPLOYEE APP */}
      <Route path="/employee-login" element={<EmployeeLogin />} />
      <Route element={<EmployeeGuard />}>
        <Route
          path="/app"
          element={
            <NotificationProvider>
              <EmployeeAppLayout />
            </NotificationProvider>
          }
        >
          <Route index element={<EmployeeDashboard />} />
          <Route path="tasks/today" element={<TodayTasksPage />} />
          <Route path="service-requests" element={<ServiceRequestsPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route path="broadcast" element={<BroadcastPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="conversation" element={<ConversationPage />} />
          <Route path="gmail" element={<GmailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="change-password"
            element={<Navigate to="/app/profile" replace />}
          />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/employee-login" replace />} />
    </Routes>
  );
}
