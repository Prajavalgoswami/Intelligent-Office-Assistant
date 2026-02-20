import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { companyAdminGoogleLogin } from "../../api/companyAdmin.api";
import api from "../../api/axios";

declare global {
  interface Window {
    google?: any;
  }
}

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Initialize Google Sign-In
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
            callback: handleGoogleCallback,
          });
          // Render the Google Sign-In button
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { 
              theme: 'outline', 
              size: 'large',
              width: '100%'
            }
          );
        }
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  const handleGoogleCallback = async (response: any) => {
    setError(null);
    try {
      const res = await companyAdminGoogleLogin(response.credential);
      const data = res.data;

      localStorage.setItem("company_admin_token", data.access_token);

      if (data.first_login) {
        navigate("/company-admin/onboarding");
      } else {
        navigate("/company-admin");
      }
    } catch (err: any) {
      console.error("Google login failed", err);
      setError(err.response?.data?.detail || "Google login failed. Please try again.");
    }
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!username || !password) {
        setError("Please enter both username and password");
        setIsLoading(false);
        return;
      }

      const res = await api.post('/company-admin/login/admin-username-password', {
        username: username,
        password: password
      });

      const data = res.data;
      localStorage.setItem("company_admin_token", data.access_token);

      // Fetch user info to check first_login
      try {
        const meRes = await api.get('/company-admin/me', {
          headers: {
            Authorization: `Bearer ${data.access_token}`
          }
        });
        
        if (meRes.data.first_login) {
          navigate("/company-admin/onboarding");
        } else {
          navigate("/company-admin");
        }
      } catch {
        navigate("/company-admin");
      }
    } catch (err: any) {
      console.error("Email login failed", err);
      setError(err.response?.data?.detail || "Invalid username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Main content */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Logo & Header */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">IOA</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
              Admin Portal
            </h1>
            <p className="text-center text-slate-600 text-sm">
              Intelligent Office Assistant
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Username & Password Form */}
            <form onSubmit={handleEmailPasswordLogin} className="space-y-5 mb-8">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Sign in with username</h3>
                <p className="text-sm text-slate-600">Enter your credentials below</p>
              </div>

              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  placeholder="admin_user"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-500 transition-all"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-500 transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-600">Or continue with</span>
              </div>
            </div>

            {/* Google Sign-In */}
            <div className="space-y-4">
              <p className="text-sm text-slate-600 text-center">
                Sign in with your company Google account
              </p>
              <div id="google-signin-button" className="w-full" />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-slate-500">
              © 2024 Intelligent Office Assistant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
