import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { EmployeeAuthProvider, useEmployeeAuth } from "./EmployeeAuthContext";

function EmployeeGuardInner() {
  const { user, loading, error, refresh } = useEmployeeAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      await refresh();
      setInitialized(true);
    };
    if (!initialized) {
      void bootstrap();
    }
  }, [initialized, refresh]);

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs text-slate-500">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  const token = localStorage.getItem("access_token");

  if (!token || !user || user.type !== "employee") {
    localStorage.removeItem("access_token");
    return <Navigate to="/employee-login" replace />;
  }

  if (error) {
    localStorage.removeItem("access_token");
    return <Navigate to="/employee-login" replace />;
  }

  return <Outlet />;
}

export default function EmployeeGuard() {
  return (
    <EmployeeAuthProvider>
      <EmployeeGuardInner />
    </EmployeeAuthProvider>
  );
}

