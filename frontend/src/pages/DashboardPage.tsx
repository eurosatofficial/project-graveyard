import { Archive, CheckCircle2, CirclePause, FolderKanban, Plus, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api";
import { ErrorState, LoadingState } from "../components/PageState";
import { ProjectCard } from "../components/ProjectCard";
import type { DashboardStats } from "../types";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setStats(await api.getDashboard());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the dashboard");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (!stats && !error) return <LoadingState label="Reading the project ledger…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats) return null;

  const cards = [
    { label: "Total projects", value: stats.total, icon: FolderKanban, tone: "neutral" },
    { label: "Active", value: stats.active, icon: Zap, tone: "active" },
    { label: "Paused", value: stats.paused, icon: CirclePause, tone: "paused" },
    { label: "Abandoned", value: stats.abandoned, icon: Archive, tone: "abandoned" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, tone: "completed" },
  ];

  return (
    <div className="page dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <p className="eyebrow">Local project index</p>
          <h1>What are we building?</h1>
          <p className="page-intro">A clear view of the code still breathing, resting, or finally laid to rest.</p>
        </div>
        <Link className="button button-primary desktop-create" to="/projects/new"><Plus size={17} />New project</Link>
      </header>

      <section className="stat-grid" aria-label="Project statistics">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div className={`stat-card stat-${tone}`} key={label}>
            <div className="stat-icon"><Icon size={18} /></div>
            <span>{label}</span>
            <strong>{value.toString().padStart(2, "0")}</strong>
          </div>
        ))}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div><p className="eyebrow">Latest activity</p><h2>Recently updated</h2></div>
          <Link className="text-link" to="/projects">View all projects <span>→</span></Link>
        </div>
        {stats.recent_projects.length ? (
          <div className="project-grid">
            {stats.recent_projects.map((project) => <ProjectCard project={project} key={project.id} />)}
          </div>
        ) : (
          <div className="empty-state"><p>No projects yet.</p><Link to="/projects/new">Create your first project</Link></div>
        )}
      </section>
    </div>
  );
}

