import type { ReactNode } from "react";

export interface ModalProps {
  title?: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({
  title,
  description,
  open,
  onClose,
  children,
  footer,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700 px-5 py-4">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
            )}
            {description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">{children}</div>
        {footer && (
          <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

