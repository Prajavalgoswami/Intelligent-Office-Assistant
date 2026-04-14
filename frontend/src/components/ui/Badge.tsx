import type { ReactNode } from "react";

export interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "muted" | "secondary" | "info";
  size?: "xs" | "sm" | "md";
  pulse?: boolean;
  dot?: boolean;
}

const variantStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  default: {
    bg:     "bg-indigo-50 dark:bg-indigo-950/40",
    text:   "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-200 dark:border-indigo-700/50",
    dot:    "bg-indigo-500 dark:bg-indigo-400",
  },
  success: {
    bg:     "bg-emerald-50 dark:bg-emerald-950/40",
    text:   "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-700/50",
    dot:    "bg-emerald-500 dark:bg-emerald-400",
  },
  warning: {
    bg:     "bg-amber-50 dark:bg-amber-950/40",
    text:   "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-700/50",
    dot:    "bg-amber-500 dark:bg-amber-400",
  },
  danger: {
    bg:     "bg-rose-50 dark:bg-rose-950/40",
    text:   "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-700/50",
    dot:    "bg-rose-500 dark:bg-rose-400",
  },
  muted: {
    bg:     "bg-slate-100 dark:bg-slate-700/40",
    text:   "text-slate-600 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-600/50",
    dot:    "bg-slate-400 dark:bg-slate-400",
  },
  secondary: {
    bg:     "bg-violet-50 dark:bg-violet-950/40",
    text:   "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-700/50",
    dot:    "bg-violet-500 dark:bg-violet-400",
  },
  info: {
    bg:     "bg-sky-50 dark:bg-sky-950/40",
    text:   "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-700/50",
    dot:    "bg-sky-500 dark:bg-sky-400",
  },
};

const sizeClasses: Record<string, string> = {
  xs: "px-1.5 py-0.5 text-[9px] gap-1",
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  pulse = false,
  dot = true,
}: BadgeProps) {
  const style = variantStyles[variant] ?? variantStyles.default;
  const sizeStyle = sizeClasses[size] ?? sizeClasses.sm;
  const shouldPulse = pulse || variant === "danger";

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-semibold
        transition-all duration-200
        ${sizeStyle}
        ${style.bg}
        ${style.text}
        ${style.border}
      `}
    >
      {dot && (
        <span className="relative flex-shrink-0 flex items-center justify-center">
          {shouldPulse && (
            <span
              className={`absolute inline-flex h-2 w-2 rounded-full ${style.dot} opacity-75 animate-ping`}
            />
          )}
          <span className={`relative inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
        </span>
      )}
      {children}
    </span>
  );
}
