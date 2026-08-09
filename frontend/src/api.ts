import type { DashboardStats, Project, ProjectPayload } from "./types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: options?.body
      ? { "Content-Type": "application/json", ...options.headers }
      : options?.headers,
  });

  if (!response.ok) {
    let message = "Something went wrong";
    try {
      const body = (await response.json()) as { detail?: string | Array<{ msg?: string }> };
      if (typeof body.detail === "string") {
        message = body.detail;
      } else if (Array.isArray(body.detail) && body.detail[0]?.msg) {
        message = body.detail[0].msg.replace(/^Value error, /, "");
      }
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const api = {
  getDashboard: () => request<DashboardStats>("/api/dashboard"),
  getCategories: () => request<string[]>("/api/categories"),
  getProjects: (params?: URLSearchParams) =>
    request<Project[]>(`/api/projects${params?.size ? `?${params.toString()}` : ""}`),
  getProject: (id: number) => request<Project>(`/api/projects/${id}`),
  createProject: (project: ProjectPayload) =>
    request<Project>("/api/projects", { method: "POST", body: JSON.stringify(project) }),
  updateProject: (id: number, project: ProjectPayload) =>
    request<Project>(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(project) }),
  deleteProject: (id: number) => request<void>(`/api/projects/${id}`, { method: "DELETE" }),
  markWorkedToday: (id: number) =>
    request<Project>(`/api/projects/${id}/work-today`, { method: "POST" }),
  getResurrectionCandidate: (excludeId?: number) =>
    request<Project>(
      `/api/resurrect/random${excludeId ? `?exclude_id=${excludeId}` : ""}`,
    ),
  resurrectProject: (id: number) =>
    request<Project>(`/api/projects/${id}/resurrect`, { method: "POST" }),
};

export function projectToPayload(project: Project): ProjectPayload {
  const { id: _id, created_at: _created, updated_at: _updated, ...payload } = project;
  return payload;
}
