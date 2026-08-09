import { ArrowRight, Dices, RotateCcw, Sprout } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api";
import { ErrorState, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import type { Project } from "../types";
import { formatDate, timeAgo } from "../utils";

export function ResurrectPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [resurrected, setResurrected] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const choose = useCallback(async (excludeId?: number) => {
    setLoading(true);
    setError(null);
    setResurrected(null);
    try {
      setProject(await api.getResurrectionCandidate(excludeId));
    } catch (cause) {
      setProject(null);
      setError(cause instanceof Error ? cause.message : "Could not choose a project");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void choose(); }, [choose]);

  async function resurrect() {
    if (!project) return;
    setLoading(true);
    setError(null);
    try {
      const updated = await api.resurrectProject(project.id);
      setProject(updated);
      setResurrected(updated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not resurrect the project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page resurrect-page">
      <header className="page-header centered-header"><div><p className="eyebrow">Random recovery</p><h1>Resurrect a project</h1><p className="page-intro">One old idea. One clear next step. See if there’s still a pulse.</p></div></header>

      {loading && !project ? <LoadingState label="Wandering the archives…" /> : error && !project ? (
        <div className="resurrect-empty"><ErrorState message={error} onRetry={() => choose()} /><Link className="text-link" to="/projects">Browse all projects →</Link></div>
      ) : project ? (
        <div className={`resurrect-card${resurrected ? " is-resurrected" : ""}`}>
          <div className="resurrect-ornament"><span /><Sprout size={28} /><span /></div>
          {resurrected ? (
            <div className="resurrect-success">
              <p className="eyebrow">Back among the living</p>
              <h2>{project.name}</h2>
              <p>It’s Active again, and today is recorded as the latest work date.</p>
              <div className="resurrect-actions">
                <button className="button button-secondary" onClick={() => choose(project.id)}><Dices size={17} />Choose another</button>
                <Link className="button button-primary" to={`/projects/${project.id}`}>View project <ArrowRight size={17} /></Link>
              </div>
            </div>
          ) : (
            <>
              <div className="resurrect-title"><StatusBadge status={project.status} /><h2>{project.name}</h2><p>{project.description}</p></div>
              <div className="resurrect-age"><strong>{timeAgo(project.last_worked_on)}</strong><span>Last worked on {formatDate(project.last_worked_on)}</span></div>
              <div className="resurrect-context"><div><span>Why it stopped</span><p>{project.reason_paused_abandoned || "No reason was recorded."}</p></div><div><span>The next step</span><p>{project.next_step}</p></div></div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="resurrect-actions"><button className="button button-secondary" onClick={() => choose(project.id)} disabled={loading}><Dices size={17} />{loading ? "Choosing…" : "Choose another"}</button><button className="button button-primary" onClick={resurrect} disabled={loading}><RotateCcw size={17} />Resurrect Project</button></div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

