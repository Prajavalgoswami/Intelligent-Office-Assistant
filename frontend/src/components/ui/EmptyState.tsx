import type { ReactNode } from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-[fadeSlideIn_0.5s_ease-out_both]">
      {/* Icon container */}
      <div className="relative mb-5">
        {/* Ambient glow rings */}
        <div className="absolute inset-0 rounded-3xl bg-indigo-400/10 dark:bg-indigo-500/10 blur-xl scale-150" />

        {/* Icon box */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-[#1e293b] dark:to-[#0f172a] border border-slate-200 dark:border-white/[0.07] shadow-inner animate-[floatSlow_4s_ease-in-out_infinite]">
          {icon ?? (
            <svg
              className="h-9 w-9 text-slate-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          )}
        </div>

        {/* Decorative dots */}
        <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full bg-indigo-300/40 dark:bg-indigo-500/30 animate-[float_2.8s_ease-in-out_infinite_0.3s]" />
        <span className="absolute -bottom-2 -left-2 h-2.5 w-2.5 rounded-full bg-blue-300/40 dark:bg-blue-500/30 animate-[float_3.5s_ease-in-out_infinite_0.8s]" />
        <span className="absolute top-1/2 -left-4 h-2 w-2 rounded-full bg-violet-300/30 dark:bg-violet-500/20 animate-[float_3s_ease-in-out_infinite_1.2s]" />
      </div>

      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
