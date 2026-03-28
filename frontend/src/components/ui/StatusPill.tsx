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

export function StatusPill({ status }: StatusPillProps) {
  const normalized = String(status).toLowerCase();

  if (normalized === "open") {
    return <Badge variant="warning">Open</Badge>;
  }

  if (normalized === "in_progress") {
    return <Badge variant="default">In progress</Badge>;
  }

  if (normalized === "resolved") {
    return <Badge variant="success">Resolved</Badge>;
  }

  if (normalized === "completed") {
    return <Badge variant="secondary">Completed</Badge>;
  }

  if (normalized === "pending") {
    return <Badge variant="muted">Pending</Badge>;
  }

  return <Badge variant="muted">{status}</Badge>;
}

