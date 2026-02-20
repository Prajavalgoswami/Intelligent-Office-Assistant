import React from 'react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step?: number;
  totalSteps?: number;
  title?: string;
  description?: string;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ 
  children, 
  step, 
  totalSteps,
  title,
  description
}) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      {/* Top progress bar */}
      {step !== undefined && totalSteps !== undefined && (
        <div className="w-full border-b border-white/10 backdrop-blur-xl bg-slate-900/80">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 flex-1 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Step {step} of {totalSteps}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          {title && (
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">{title}</h1>
              {description && (
                <p className="text-base text-slate-400">{description}</p>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-white/10 rounded-2xl p-8 lg:p-10 backdrop-blur-sm shadow-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;