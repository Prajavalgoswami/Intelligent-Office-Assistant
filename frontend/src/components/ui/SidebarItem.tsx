import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";

export interface SidebarItemProps {
  to: string;
  label: string;
  icon?: ReactNode;
  exact?: boolean;
  badgeCount?: number;
}

export function SidebarItem({
  to,
  label,
  icon,
  exact,
  badgeCount,
}: SidebarItemProps) {
  const hasBadge = typeof badgeCount === "number" && badgeCount > 0;

  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        [
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
        ].join(" ")
      }
    >
      {icon && (
        <span className="h-5 w-5 text-slate-500 shrink-0">{icon}</span>
      )}
      <span className="truncate">{label}</span>
      {hasBadge && (
        <span className="ml-auto inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-[11px] font-semibold text-white">
          {badgeCount}
        </span>
      )}
    </NavLink>
  );
}

