import { ArrowUpRight, CalendarClock } from "lucide-react";
import { Link } from "react-router-dom";

import type { Project } from "../types";
import { formatDate } from "../utils";
import { StatusBadge } from "./StatusBadge";

export function ProjectCard({ project, graveyard = false }: { project: Project; graveyard?: boolean }) {
  return (
    <Link className={`project-card${graveyard ? " project-card-graveyard" : ""}`} to={`/projects/${project.id}`}>
      <div className="card-topline">
        <StatusBadge status={project.status} />
        <ArrowUpRight className="card-arrow" size={18} aria-hidden="true" />
      </div>
      <div>
        <h3>{project.name}</h3>
        <p className="card-description">{project.description}</p>
      </div>
      <div className="tag-list" aria-label="Technologies">
        {project.technology_tags.map((tag) => <span className="tech-tag" key={tag}>{tag}</span>)}
      </div>
      <div className="card-meta">
        <CalendarClock size={15} />
        Last worked {formatDate(project.last_worked_on, { month: "short", day: "numeric", year: "numeric" })}
      </div>
      <div className="next-step-preview">
        <span>Next step</span>
        <p>{project.next_step}</p>
      </div>
    </Link>
  );
}

