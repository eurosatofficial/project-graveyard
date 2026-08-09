from contextlib import asynccontextmanager
from datetime import date
from pathlib import Path
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, HTTPException, Query, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import String, case, cast, func, or_, select
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import Project
from .schemas import DashboardStats, MessageResponse, ProjectCreate, ProjectRead, ProjectUpdate
from .seed import seed_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
        db.execute(select(Project).limit(1))
    yield


app = FastAPI(
    title="Project Graveyard API",
    description="Local API for keeping unfinished coding projects visible.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DbSession = Annotated[Session, Depends(get_db)]


def get_project_or_404(project_id: int, db: Session) -> Project:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.get("/api/health", response_model=MessageResponse, tags=["system"])
def health_check() -> MessageResponse:
    return MessageResponse(message="Project Graveyard is awake")


@app.get("/api/dashboard", response_model=DashboardStats, tags=["dashboard"])
def get_dashboard(db: DbSession) -> DashboardStats:
    counts = db.execute(
        select(
            func.count(Project.id),
            func.sum(case((Project.status == "Active", 1), else_=0)),
            func.sum(case((Project.status == "Paused", 1), else_=0)),
            func.sum(case((Project.status == "Abandoned", 1), else_=0)),
            func.sum(case((Project.status == "Completed", 1), else_=0)),
        )
    ).one()
    recent = db.scalars(
        select(Project).order_by(Project.updated_at.desc(), Project.id.desc()).limit(5)
    ).all()
    return DashboardStats(
        total=counts[0] or 0,
        active=counts[1] or 0,
        paused=counts[2] or 0,
        abandoned=counts[3] or 0,
        completed=counts[4] or 0,
        recent_projects=list(recent),
    )


@app.get("/api/categories", response_model=list[str], tags=["projects"])
def list_categories(db: DbSession) -> list[str]:
    return list(db.scalars(select(Project.category).distinct().order_by(Project.category)).all())


@app.get("/api/projects", response_model=list[ProjectRead], tags=["projects"])
def list_projects(
    db: DbSession,
    search: str | None = Query(default=None, max_length=160),
    project_status: Literal["Active", "Paused", "Abandoned", "Completed"] | None = Query(
        default=None, alias="status"
    ),
    category: str | None = Query(default=None, max_length=80),
    sort: Literal["newest", "oldest"] = "newest",
) -> list[Project]:
    statement = select(Project)
    if search and search.strip():
        term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                Project.name.ilike(term),
                Project.description.ilike(term),
                Project.category.ilike(term),
                cast(Project.technology_tags, String).ilike(term),
                Project.next_step.ilike(term),
            )
        )
    if project_status:
        statement = statement.where(Project.status == project_status)
    if category:
        statement = statement.where(Project.category == category)

    order = Project.last_worked_on.desc() if sort == "newest" else Project.last_worked_on.asc()
    return list(db.scalars(statement.order_by(order, Project.updated_at.desc())).all())


@app.get("/api/resurrect/random", response_model=ProjectRead, tags=["resurrect"])
def random_resurrection_candidate(
    db: DbSession,
    exclude_id: int | None = Query(default=None, ge=1),
) -> Project:
    eligible = select(Project).where(Project.status.in_(["Paused", "Abandoned"]))
    statement = eligible
    if exclude_id is not None:
        alternative_count = db.scalar(
            select(func.count())
            .select_from(Project)
            .where(Project.status.in_(["Paused", "Abandoned"]), Project.id != exclude_id)
        )
        if alternative_count:
            statement = statement.where(Project.id != exclude_id)
    project = db.scalar(statement.order_by(func.random()).limit(1))
    if project is None:
        raise HTTPException(status_code=404, detail="No paused or abandoned projects are available")
    return project


@app.get("/api/projects/{project_id}", response_model=ProjectRead, tags=["projects"])
def get_project(project_id: int, db: DbSession) -> Project:
    return get_project_or_404(project_id, db)


@app.post(
    "/api/projects",
    response_model=ProjectRead,
    status_code=status.HTTP_201_CREATED,
    tags=["projects"],
)
def create_project(payload: ProjectCreate, db: DbSession) -> Project:
    project = Project(**payload.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@app.put("/api/projects/{project_id}", response_model=ProjectRead, tags=["projects"])
def update_project(project_id: int, payload: ProjectUpdate, db: DbSession) -> Project:
    project = get_project_or_404(project_id, db)
    for field, value in payload.model_dump().items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


@app.post("/api/projects/{project_id}/work-today", response_model=ProjectRead, tags=["projects"])
def mark_worked_today(project_id: int, db: DbSession) -> Project:
    project = get_project_or_404(project_id, db)
    project.last_worked_on = date.today()
    db.commit()
    db.refresh(project)
    return project


@app.post("/api/projects/{project_id}/resurrect", response_model=ProjectRead, tags=["resurrect"])
def resurrect_project(project_id: int, db: DbSession) -> Project:
    project = get_project_or_404(project_id, db)
    if project.status not in {"Paused", "Abandoned"}:
        raise HTTPException(status_code=409, detail="Only paused or abandoned projects can be resurrected")
    project.status = "Active"
    project.last_worked_on = date.today()
    db.commit()
    db.refresh(project)
    return project


@app.delete(
    "/api/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["projects"],
)
def delete_project(project_id: int, db: DbSession) -> Response:
    project = get_project_or_404(project_id, db)
    db.delete(project)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if (FRONTEND_DIST / "assets").exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="frontend-assets")


@app.get("/{full_path:path}", include_in_schema=False)
def serve_frontend(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="Not found")
    index_file = FRONTEND_DIST / "index.html"
    if not index_file.exists():
        raise HTTPException(status_code=404, detail="Frontend has not been built yet")
    return FileResponse(index_file)
