import { Badge } from "./Badge";

export type Status =
  | "open"
  | "in_progress"
  | "completed"
  | "resolved"
  | "pending"
  | "unknown"
  | string;

export interface StatusPillProps {
  status: Status;
}

const statusConfig: Record<string, { label: string; variant: "warning" | "info" | "success" | "secondary" | "muted" | "default" | "danger"; pulse?: boolean }> = {
  open:        { label: "Open",        variant: "warning",   pulse: true },
  in_progress: { label: "In Progress", variant: "info",      pulse: true },
  resolved:    { label: "Resolved",    variant: "success" },
  completed:   { label: "Completed",   variant: "secondary" },
  pending:     { label: "Pending",     variant: "muted" },
};

export function StatusPill({ status }: StatusPillProps) {
  const normalized = String(status).toLowerCase();
  const config = statusConfig[normalized];

  if (config) {
    return (
      <Badge variant={config.variant} size="sm" pulse={config.pulse}>
        {config.label}
      </Badge>
    );
  }

  // Fallback for unknown statuses
  return (
    <Badge variant="muted" size="sm">
      {status}
    </Badge>
  );
}
