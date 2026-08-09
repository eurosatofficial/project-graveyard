import { Archive, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { api } from "../api";
import { ErrorState, LoadingState } from "../components/PageState";
import { ProjectCard } from "../components/ProjectCard";
import type { Project } from "../types";

export function GraveyardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ status: "Abandoned", sort: "newest" });
    if (search.trim()) params.set("search", search.trim());
    try {
      setProjects(await api.getProjects(params));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the graveyard");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 180);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div className="page graveyard-page">
      <header className="graveyard-header">
        <div className="graveyard-copy"><p className="eyebrow">The quiet archive</p><h1>Graveyard</h1><p>Projects that taught you something, even if they never made it home.</p></div>
        <div className="graveyard-count"><Archive size={20} /><strong>{projects.length.toString().padStart(2, "0")}</strong><span>abandoned<br />projects</span></div>
      </header>

      <div className="graveyard-toolbar"><label className="search-field"><Search size={18} /><input aria-label="Search abandoned projects" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the archives…" /></label><p>Nothing here is wasted.</p></div>

      {loading ? <LoadingState label="Reading the headstones…" /> : error ? <ErrorState message={error} onRetry={load} /> : projects.length ? (
        <div className="project-grid graveyard-grid">{projects.map((project) => <ProjectCard graveyard project={project} key={project.id} />)}</div>
      ) : (
        <div className="empty-state"><p>{search ? "No abandoned projects match this search." : "The graveyard is empty."}</p></div>
      )}
    </div>
  );
}

