from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .models import Project


def seed_database(db: Session) -> None:
    project_count = db.scalar(select(func.count()).select_from(Project))
    if project_count:
        return

    today = date.today()
    examples = [
        Project(
            name="Packet Garden",
            description="A tiny local dashboard for exploring home-network traffic patterns.",
            status="Active",
            category="Developer Tool",
            technology_tags=["Python", "FastAPI", "React"],
            repository_url="https://github.com/example/packet-garden",
            local_project_path="~/Code/packet-garden",
            date_started=today - timedelta(days=42),
            last_worked_on=today - timedelta(days=1),
            reason_paused_abandoned=None,
            next_step="Add a compact hourly traffic chart.",
            notes="Keep packet data local and avoid collecting payload content.",
        ),
        Project(
            name="Dotfile Atlas",
            description="An interactive map of configuration files and the tools that use them.",
            status="Paused",
            category="Developer Tool",
            technology_tags=["TypeScript", "Vite", "D3"],
            repository_url="https://github.com/example/dotfile-atlas",
            local_project_path="~/Code/dotfile-atlas",
            date_started=today - timedelta(days=118),
            last_worked_on=today - timedelta(days=26),
            reason_paused_abandoned="The graph layout needed a simpler interaction model.",
            next_step="Replace the force graph with a searchable dependency list.",
            notes="The data model is solid; the original visualization was the problem.",
        ),
        Project(
            name="Commit Almanac",
            description="A calm, calendar-based viewer for personal Git activity.",
            status="Completed",
            category="Productivity",
            technology_tags=["Rust", "SQLite", "Tauri"],
            repository_url="https://github.com/example/commit-almanac",
            local_project_path="~/Code/commit-almanac",
            date_started=today - timedelta(days=210),
            last_worked_on=today - timedelta(days=7),
            reason_paused_abandoned=None,
            next_step="Package the current release notes.",
            notes="Version 1.0 covers the original scope.",
        ),
        Project(
            name="Nightstand API",
            description="A reading log API designed around books currently in progress.",
            status="Abandoned",
            category="API",
            technology_tags=["Go", "PostgreSQL", "Docker"],
            repository_url=None,
            local_project_path="~/Archive/nightstand-api",
            date_started=today - timedelta(days=330),
            last_worked_on=today - timedelta(days=143),
            reason_paused_abandoned="The infrastructure outweighed the needs of a personal reading log.",
            next_step="Rebuild the useful endpoints with SQLite and no containers.",
            notes="The import parser can be reused.",
        ),
        Project(
            name="Tiny Type Lab",
            description="A browser playground for comparing readable programming typefaces.",
            status="Paused",
            category="Web Experiment",
            technology_tags=["React", "CSS", "Vite"],
            repository_url="https://github.com/example/tiny-type-lab",
            local_project_path="~/Code/tiny-type-lab",
            date_started=today - timedelta(days=76),
            last_worked_on=today - timedelta(days=54),
            reason_paused_abandoned="Font loading made the first version too slow.",
            next_step="Limit the comparison set to locally installed fonts.",
            notes="Preserve the split-pane comparison component.",
        ),
        Project(
            name="Regex Field Notes",
            description="A searchable collection of annotated regular-expression examples.",
            status="Abandoned",
            category="Reference",
            technology_tags=["Vue", "Markdown", "IndexedDB"],
            repository_url=None,
            local_project_path=None,
            date_started=today - timedelta(days=470),
            last_worked_on=today - timedelta(days=289),
            reason_paused_abandoned="The content format became more complicated than the examples.",
            next_step="Start again with plain Markdown files and static search.",
            notes="Only the explanation cards are worth carrying forward.",
        ),
    ]
    db.add_all(examples)
    db.commit()

