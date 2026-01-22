import React from 'react';
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";
import { companyAdminGoogleLogin } from "../../api/companyAdmin.api";
interface CompanyAdminLoginResponse {
  access_token: string;
  token_type: string;
  first_login: boolean;
}

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      // TEMP: replace with real Google Sign-In later
      const googleIdToken = window.prompt("Paste Google ID token");

      if (!googleIdToken) return;

      const res = await companyAdminGoogleLogin(googleIdToken);

      const data = res.data as CompanyAdminLoginResponse;

      localStorage.setItem("company_admin_token", data.access_token);

      if (data.first_login) {
        navigate("/company-admin/onboarding");
      } else {
        navigate("/company-admin");
      }
    } catch (err) {
      console.error("Company admin login failed", err);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            Admin Portal
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Sign in to your company admin account
          </p>
        </div>

        {/* Login sections */}
        <div className="space-y-4">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-medium transition-colors duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
                or
              </span>
            </div>
          </div>

          {/* Email/Password Login (Disabled) */}
          <div className="space-y-3 opacity-50 pointer-events-none">
            <input
              type="email"
              placeholder="company@example.com"
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            />
            <button
              disabled
              className="w-full px-4 py-2.5 rounded-lg bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-sm"
            >
              Sign In
            </button>
          </div>

          <p className="text-center text-xs text-slate-600 dark:text-slate-400">
            Email sign-in coming soon
          </p>
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-slate-500">
          <p>For support, contact your system administrator</p>
        </div>
      </div>
    </AuthLayout>
  );
};
