import type { JSX } from "react";
import { Navigate } from "react-router-dom";

export default function RequireSuperAdmin({
  children,
}: {
  children: JSX.Element;
}) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/super-admin/login" replace />;
  }

  // Token validity & role are enforced by backend
  return children;
}
