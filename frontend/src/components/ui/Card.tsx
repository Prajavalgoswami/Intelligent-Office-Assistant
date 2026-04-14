import type { ReactNode } from "react";

export interface CardProps {
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  accentColor?: "blue" | "emerald" | "amber" | "rose" | "indigo" | "violet" | "cyan" | "orange";
  headerAction?: ReactNode;
  noPadding?: boolean;
  /** When true, card becomes a flex column and the body stretches to fill remaining space */
  fillHeight?: boolean;
}

const accentGradientMap: Record<string, string> = {
  blue:    "from-blue-500 to-blue-600",
  emerald: "from-emerald-500 to-teal-600",
  amber:   "from-amber-500 to-orange-500",
  rose:    "from-rose-500 to-pink-600",
  indigo:  "from-indigo-500 to-indigo-600",
  violet:  "from-violet-500 to-purple-600",
  cyan:    "from-cyan-500 to-sky-600",
  orange:  "from-orange-500 to-amber-600",
};

const accentBorderMap: Record<string, string> = {
  blue:    "border-l-blue-500",
  emerald: "border-l-emerald-500",
  amber:   "border-l-amber-500",
  rose:    "border-l-rose-500",
  indigo:  "border-l-indigo-500",
  violet:  "border-l-violet-500",
  cyan:    "border-l-cyan-500",
  orange:  "border-l-orange-500",
};

const accentShadowMap: Record<string, string> = {
  blue:    "hover:shadow-blue-100 dark:hover:shadow-blue-900/20",
  emerald: "hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20",
  amber:   "hover:shadow-amber-100 dark:hover:shadow-amber-900/20",
  rose:    "hover:shadow-rose-100 dark:hover:shadow-rose-900/20",
  indigo:  "hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20",
  violet:  "hover:shadow-violet-100 dark:hover:shadow-violet-900/20",
  cyan:    "hover:shadow-cyan-100 dark:hover:shadow-cyan-900/20",
  orange:  "hover:shadow-orange-100 dark:hover:shadow-orange-900/20",
};

export function Card({
  title,
  description,
  children,
  className,
  icon,
  accentColor,
  headerAction,
  noPadding = false,
  fillHeight = false,
}: CardProps) {
  const gradient = accentColor ? accentGradientMap[accentColor] : accentGradientMap.indigo;
  const shadow   = accentColor ? accentShadowMap[accentColor]   : "";

  return (
    <section
      className={`
        rounded-2xl border shadow-sm
        bg-white dark:bg-[#111827]
        border-slate-200/80 dark:border-white/[0.06]
        transition-all duration-300 ease-out
        hover:shadow-lg ${shadow}
        hover:-translate-y-0.5
        animate-[fadeSlideIn_0.4s_ease-out_both]
        ${fillHeight ? "flex flex-col overflow-hidden" : "overflow-hidden"}
        ${accentColor ? `border-l-[3px] ${accentBorderMap[accentColor]}` : ""}
        ${className ?? ""}
      `}
    >
      {/* Card header */}
      {(title || description || icon || headerAction) && (
        <header
          className={`flex items-start justify-between gap-3 ${
            noPadding ? "px-5 pt-5 pb-0" : "px-5 pt-5 pb-0"
          } mb-4`}
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {icon && (
              <div
                className={`
                  flex-shrink-0 flex items-center justify-center
                  w-9 h-9 rounded-xl
                  bg-gradient-to-br ${gradient}
                  text-white shadow-md
                  transition-transform duration-200 group-hover:scale-110
                `}
              >
                <span className="w-[18px] h-[18px] block">{icon}</span>
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
          {headerAction && (
            <div className="flex-shrink-0">{headerAction}</div>
          )}
        </header>
      )}

      {/* Card body */}
      <div
        className={[
          noPadding ? "" : "px-5 pb-5",
          fillHeight ? "flex-1 min-h-0 overflow-hidden flex flex-col" : "",
        ].filter(Boolean).join(" ")}
      >
        {children}
      </div>
    </section>
  );
}
