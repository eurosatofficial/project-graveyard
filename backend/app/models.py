from datetime import date, datetime

from sqlalchemy import CheckConstraint, Date, DateTime, Index, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (
        CheckConstraint(
            "status IN ('Active', 'Paused', 'Abandoned', 'Completed')",
            name="ck_projects_status",
        ),
        Index("idx_projects_status_updated", "status", "updated_at"),
        Index("idx_projects_category", "category"),
        Index("idx_projects_last_worked_on", "last_worked_on"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    technology_tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    repository_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    local_project_path: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    date_started: Mapped[date] = mapped_column(Date, nullable=False)
    last_worked_on: Mapped[date] = mapped_column(Date, nullable=False)
    reason_paused_abandoned: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_step: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.current_timestamp()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

