import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api, projectToPayload } from "../api";
import { ErrorState, LoadingState } from "../components/PageState";
import { ProjectForm } from "../components/ProjectForm";
import type { ProjectPayload } from "../types";

export function ProjectFormPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const id = Number(projectId);
  const [initialValue, setInitialValue] = useState<ProjectPayload | null>(mode === "create" ? null : null);
  const [loading, setLoading] = useState(mode === "edit");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (mode !== "edit") return;
    setLoading(true);
    setError(null);
    try {
      const project = await api.getProject(id);
      setInitialValue(projectToPayload(project));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the project");
    } finally {
      setLoading(false);
    }
  }, [id, mode]);

  useEffect(() => { void load(); }, [load]);

  async function submit(payload: ProjectPayload) {
    setBusy(true);
    setError(null);
    try {
      const project = mode === "create" ? await api.createProject(payload) : await api.updateProject(id, payload);
      navigate(`/projects/${project.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the project");
      setBusy(false);
    }
  }

  if (loading) return <LoadingState label="Opening the project record…" />;
  if (mode === "edit" && error && !initialValue) return <ErrorState message={error} onRetry={load} />;

  const backPath = mode === "edit" ? `/projects/${id}` : "/projects";
  return (
    <div className="page form-page">
      <Link className="back-link" to={backPath}><ArrowLeft size={16} />Back</Link>
      <header className="page-header compact-header">
        <div><p className="eyebrow">{mode === "create" ? "Add to the ledger" : "Revise the record"}</p><h1>{mode === "create" ? "New project" : "Edit project"}</h1><p className="page-intro">{mode === "create" ? "Write down enough that future you can pick it up." : "Keep the state of the work honest and useful."}</p></div>
      </header>
      <ProjectForm
        key={initialValue ? JSON.stringify(initialValue) : "new"}
        initialValue={initialValue ?? undefined}
        submitLabel={mode === "create" ? "Create project" : "Save changes"}
        busy={busy}
        error={error}
        onSubmit={submit}
        onCancel={() => navigate(backPath)}
      />
    </div>
  );
}

