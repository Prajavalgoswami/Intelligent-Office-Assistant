import type { ReactNode } from "react";
import { useEffect } from "react";

export interface ModalProps {
  title?: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  title,
  description,
  open,
  onClose,
  children,
  footer,
  size = "md",
}: ModalProps) {
  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md animate-[fadeIn_0.2s_ease-out_both]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        className={`
          relative z-50 w-full ${sizeMap[size]} min-w-0
          rounded-2xl overflow-hidden
          bg-white dark:bg-[#111827]
          border border-slate-200/80 dark:border-white/[0.08]
          shadow-[0_24px_80px_rgba(0,0,0,0.18)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.6)]
          animate-[modalSlideUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)_both]
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-white/[0.07] px-6 py-4">
          <div className="min-w-0">
            {title && (
              <h2 id="modal-title" className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={`
              flex-shrink-0 flex items-center justify-center
              w-8 h-8 rounded-xl
              text-slate-400 dark:text-slate-500
              hover:text-slate-700 dark:hover:text-slate-200
              hover:bg-slate-100 dark:hover:bg-white/10
              hover:rotate-90
              transition-all duration-200
            `}
            aria-label="Close modal"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-sm text-slate-700 dark:text-slate-300">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-white/[0.02] px-6 py-4 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
