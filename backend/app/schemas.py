from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


ProjectStatus = Literal["Active", "Paused", "Abandoned", "Completed"]


class ProjectFields(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    description: str = Field(min_length=1)
    status: ProjectStatus
    category: str = Field(min_length=1, max_length=80)
    technology_tags: list[str] = Field(default_factory=list)
    repository_url: str | None = Field(default=None, max_length=500)
    local_project_path: str | None = Field(default=None, max_length=1000)
    date_started: date
    last_worked_on: date
    reason_paused_abandoned: str | None = None
    next_step: str = Field(min_length=1)
    notes: str = ""

    @field_validator("name", "description", "category", "next_step")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("must not be blank")
        return value

    @field_validator("repository_url", "local_project_path", "reason_paused_abandoned")
    @classmethod
    def empty_optional_text_to_none(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    @field_validator("technology_tags")
    @classmethod
    def clean_tags(cls, tags: list[str]) -> list[str]:
        cleaned: list[str] = []
        for tag in tags:
            normalized = tag.strip()
            if normalized and normalized.lower() not in {item.lower() for item in cleaned}:
                cleaned.append(normalized)
        return cleaned


class ProjectCreate(ProjectFields):
    pass


class ProjectUpdate(ProjectFields):
    pass


class ProjectRead(ProjectFields):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class DashboardStats(BaseModel):
    total: int
    active: int
    paused: int
    abandoned: int
    completed: int
    recent_projects: list[ProjectRead]


class MessageResponse(BaseModel):
    message: str

