import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[1] / "project_graveyard.db"
DATABASE_PATH = Path(
    os.environ.get("PROJECT_GRAVEYARD_DATABASE_PATH", DEFAULT_DATABASE_PATH)
).expanduser().resolve()
DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
