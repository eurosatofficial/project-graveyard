import { ListFilter, Plus, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api";
import { ErrorState, LoadingState } from "../components/PageState";
import { ProjectCard } from "../components/ProjectCard";
import { PROJECT_STATUSES, type Project } from "../types";

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    params.set("sort", sort);
    try {
      const [projectList, categoryList] = await Promise.all([
        api.getProjects(params),
        api.getCategories(),
      ]);
      setProjects(projectList);
      setCategories(categoryList);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load projects");
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 180);
    return () => window.clearTimeout(timer);
  }, [load]);

  const hasFilters = Boolean(search || status || category || sort !== "newest");

  function clearFilters() {
    setSearch("");
    setStatus("");
    setCategory("");
    setSort("newest");
  }

  return (
    <div className="page">
      <header className="page-header">
        <div><p className="eyebrow">The whole collection</p><h1>Projects</h1><p className="page-intro">Every experiment, useful tool, and promising loose end.</p></div>
        <Link className="button button-primary desktop-create" to="/projects/new"><Plus size={17} />New project</Link>
      </header>

      <section className="filter-bar" aria-label="Project filters">
        <label className="search-field">
          <Search size={18} />
          <input aria-label="Search projects" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search projects…" />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={16} /></button>}
        </label>
        <div className="select-wrap"><ListFilter size={16} /><select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{PROJECT_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="select-wrap"><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="select-wrap"><select aria-label="Sort projects" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Recently worked</option><option value="oldest">Longest untouched</option></select></div>
      </section>

      <div className="results-heading">
        <p><strong>{projects.length}</strong> {projects.length === 1 ? "project" : "projects"}</p>
        {hasFilters && <button className="clear-button" type="button" onClick={clearFilters}>Clear filters</button>}
      </div>

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={load} /> : projects.length ? (
        <div className="project-grid">{projects.map((project) => <ProjectCard project={project} key={project.id} />)}</div>
      ) : (
        <div className="empty-state"><p>No projects match this search.</p>{hasFilters && <button type="button" onClick={clearFilters}>Reset filters</button>}</div>
      )}
    </div>
  );
}

