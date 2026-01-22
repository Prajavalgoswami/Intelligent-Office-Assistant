import React from 'react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step?: number;
  totalSteps?: number;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ 
  children, 
  step, 
  totalSteps 
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Progress indicator */}
      {step !== undefined && totalSteps !== undefined && (
        <div className="w-full border-b border-slate-200 dark:border-slate-800">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-900 dark:bg-white transition-all duration-300"
                  style={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Step text */}
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Step {step} of {totalSteps}
            </div>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </div>
    </div>
  );
};