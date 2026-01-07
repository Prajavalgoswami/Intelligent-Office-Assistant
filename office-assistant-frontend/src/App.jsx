import { Routes, Route, Navigate } from "react-router-dom";

import SuperAdminLogin from "./pages/super-admin/Login";
import SuperAdminHome from "./pages/super-admin/Home";
import CreateCompany from "./pages/super-admin/CreateCompany";

import SuperAdminGuard from "./routes/SuperAdminGuard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/super-admin/login" />} />

      <Route path="/super-admin/login" element={<SuperAdminLogin />} />

      <Route
        path="/super-admin"
        element={
          <SuperAdminGuard>
            <SuperAdminHome />
          </SuperAdminGuard>
        }
      />

      <Route
        path="/super-admin/companies/create"
        element={
          <SuperAdminGuard>
            <CreateCompany />
          </SuperAdminGuard>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
