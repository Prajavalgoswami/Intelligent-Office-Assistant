import type { ReactNode } from "react";

export interface CardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export function Card({ title, description, children, className }: CardProps) {
  return (
    <section
      className={`rounded-xl border p-5 shadow-sm sm:p-6 dark:border-slate-700 dark:bg-slate-800/50 ${className ?? ""} bg-white border-slate-200`}
    >
      {(title || description) && (
        <header className="mb-4">
          {title && (
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

