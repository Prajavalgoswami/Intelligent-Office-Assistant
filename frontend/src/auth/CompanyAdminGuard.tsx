import { Navigate, Outlet } from "react-router-dom"

export default function CompanyAdminGuard() {
  const token = localStorage.getItem("company_admin_token")

  if (!token) {
    return <Navigate to="/company-admin/login" replace />
  }

  return <Outlet />
}
