import type { ProjectStatus } from "../types";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{status}</span>;
}

