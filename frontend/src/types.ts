export const PROJECT_STATUSES = ["Active", "Paused", "Abandoned", "Completed"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  category: string;
  technology_tags: string[];
  repository_url: string | null;
  local_project_path: string | null;
  date_started: string;
  last_worked_on: string;
  reason_paused_abandoned: string | null;
  next_step: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type ProjectPayload = Omit<Project, "id" | "created_at" | "updated_at">;

export interface DashboardStats {
  total: number;
  active: number;
  paused: number;
  abandoned: number;
  completed: number;
  recent_projects: Project[];
}

