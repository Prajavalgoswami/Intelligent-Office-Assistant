import React from 'react';

interface DashboardAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const CompanyAdminDashboard: React.FC = () => {
  const actions: DashboardAction[] = [
    {
      id: 'add-department',
      title: 'Add Department',
      description: 'Create a new department in your organization',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      id: 'add-role',
      title: 'Add Role',
      description: 'Define a new job role in your company',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      id: 'add-employee',
      title: 'Add Employee',
      description: 'Onboard a new employee to the system',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      id: 'view-departments',
      title: 'View Departments',
      description: 'Browse and manage all departments',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      id: 'view-roles',
      title: 'View Roles',
      description: 'Manage all job roles and permissions',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
  ];

  const handleActionClick = (actionId: string) => {
    console.log(`Action clicked: ${actionId}`);
  };

  return (
    <div className="space-y-8">
      {/* Intro section */}
      <div>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your organization structure, departments, roles, and employees below.
        </p>
      </div>

      {/* Action cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleActionClick(action.id)}
            className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-left hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md dark:hover:shadow-lg transition-all duration-200"
          >
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-4">
              {/* Icon */}
              <div className="inline-flex w-fit rounded-lg bg-slate-100 dark:bg-slate-800 p-3 text-slate-900 dark:text-white group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors duration-200">
                {action.icon}
              </div>

              {/* Text */}
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {action.description}
                </p>
              </div>

              {/* Arrow indicator */}
              <div className="flex items-center gap-2 pt-2">
                <svg
                  className="w-4 h-4 text-slate-500 dark:text-slate-500 group-hover:translate-x-1 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-all duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};