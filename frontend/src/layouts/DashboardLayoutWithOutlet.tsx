import { Outlet, useLocation } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';

export const DashboardLayoutWithOutlet = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('departments')) return 'Departments';
    if (path.includes('roles')) return 'Roles';
    if (path.includes('users')) return 'Team Members';
    return 'Dashboard';
  };

  return (
    <DashboardLayout pageTitle={getPageTitle()}>
      <Outlet />
    </DashboardLayout>
  );
};
