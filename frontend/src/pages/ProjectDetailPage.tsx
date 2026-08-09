import { ArrowLeft, CalendarCheck, ExternalLink, FileCode2, GitBranch, Pencil, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { api, projectToPayload } from "../api";
import { ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { PROJECT_STATUSES, type Project, type ProjectStatus } from "../types";
import { formatDate, formatDateTime } from "../utils";

export function ProjectDetailPage() {
  const navigate = useNavigate();
  const id = Number(useParams().projectId);
  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<ProjectStatus>("Active");
  const [nextStep, setNextStep] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const value = await api.getProject(id);
      setProject(value);
      setStatus(value.status);
      setNextStep(value.next_step);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the project");
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function saveQuickUpdate() {
    if (!project || !nextStep.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.updateProject(id, {
        ...projectToPayload(project),
        status,
        next_step: nextStep.trim(),
      });
      setProject(updated);
      setNotice("Project status and next step saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the update");
    } finally {
      setBusy(false);
    }
  }

  async function markToday() {
    if (!project) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await api.markWorkedToday(id);
      setProject(updated);
      setNotice("Last worked on is now today.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the work date");
    } finally {
      setBusy(false);
    }
  }

  async function removeProject() {
    if (!project || !window.confirm(`Permanently delete “${project.name}”?`)) return;
    setBusy(true);
    try {
      await api.deleteProject(id);
      navigate("/projects");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the project");
      setBusy(false);
    }
  }

  if (!project && !error) return <LoadingState label="Opening the project record…" />;
  if (!project && error) return <ErrorState message={error} onRetry={load} />;
  if (!project) return null;

  return (
    <div className="page detail-page">
      <Link className="back-link" to="/projects"><ArrowLeft size={16} />All projects</Link>
      <header className="detail-header">
        <div>
          <div className="detail-status-row"><StatusBadge status={project.status} /><span>{project.category}</span></div>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <div className="detail-actions">
          <Link className="button button-secondary" to={`/projects/${id}/edit`}><Pencil size={16} />Edit</Link>
          <button className="button button-secondary danger-button" onClick={removeProject} disabled={busy}><Trash2 size={16} />Delete</button>
        </div>
      </header>

      {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice(null)} aria-label="Dismiss">×</button></div>}
      {error && <div className="notice notice-error" role="alert">{error}<button onClick={() => setError(null)} aria-label="Dismiss">×</button></div>}

      <div className="detail-layout">
        <div className="detail-main">
          <section className="detail-panel quick-update-panel">
            <div className="panel-heading"><div><p className="eyebrow">Current state</p><h2>Pick up where you left off</h2></div><CalendarCheck size={22} /></div>
            <div className="quick-fields">
              <label className="field"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)}>{PROJECT_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="field field-wide"><span>Next step</span><textarea rows={4} required value={nextStep} onChange={(event) => setNextStep(event.target.value)} /></label>
            </div>
            <div className="quick-actions">
              <button className="button button-secondary" onClick={markToday} disabled={busy}><CalendarCheck size={16} />Worked on this today</button>
              <button className="button button-primary" onClick={saveQuickUpdate} disabled={busy || !nextStep.trim()}><Save size={16} />{busy ? "Saving…" : "Save update"}</button>
            </div>
          </section>

          <section className="detail-panel">
            <div className="panel-heading"><div><p className="eyebrow">Context</p><h2>Notes from the dig site</h2></div><FileCode2 size={22} /></div>
            <div className="prose-block"><h3>Reason paused or abandoned</h3><p>{project.reason_paused_abandoned || "No reason recorded."}</p></div>
            <div className="prose-block"><h3>Notes</h3><p className={project.notes ? "preserve-lines" : "muted"}>{project.notes || "No notes yet."}</p></div>
          </section>
        </div>

        <aside className="detail-sidebar">
          <section className="detail-panel detail-facts">
            <h2>Project details</h2>
            <dl>
              <div><dt>Date started</dt><dd>{formatDate(project.date_started)}</dd></div>
              <div><dt>Last worked on</dt><dd>{formatDate(project.last_worked_on)}</dd></div>
              <div><dt>Created</dt><dd>{formatDateTime(project.created_at)}</dd></div>
              <div><dt>Last updated</dt><dd>{formatDateTime(project.updated_at)}</dd></div>
            </dl>
          </section>
          <section className="detail-panel">
            <h2>Technology</h2>
            <div className="tag-list">{project.technology_tags.length ? project.technology_tags.map((tag) => <span className="tech-tag" key={tag}>{tag}</span>) : <span className="muted">No tags</span>}</div>
          </section>
          {(project.repository_url || project.local_project_path) && <section className="detail-panel project-links"><h2>Locations</h2>{project.repository_url && <a href={project.repository_url} target="_blank" rel="noreferrer"><GitBranch size={16} /><span>Repository</span><ExternalLink size={14} /></a>}{project.local_project_path && <div><FileCode2 size={16} /><code>{project.local_project_path}</code></div>}</section>}
        </aside>
      </div>
    </div>
  );
}

