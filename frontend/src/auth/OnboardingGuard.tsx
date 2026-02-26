import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentAdmin } from '../api/companyAdmin.api';

export default function OnboardingGuard() {
  const [isFirstLogin, setIsFirstLogin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFirstLogin = async () => {
      try {
        const res = await getCurrentAdmin();
        setIsFirstLogin(res.data.first_login);
      } catch (error) {
        console.error('Failed to check onboarding status', error);
        setIsFirstLogin(false);
      } finally {
        setLoading(false);
      }
    };

    checkFirstLogin();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-950">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Allow onboarding only if first_login is true
  if (!isFirstLogin) {
    return <Navigate to="/company-admin" replace />;
  }

  return <Outlet />;
}
