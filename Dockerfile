# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-build

WORKDIR /build/frontend
RUN corepack enable

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/ ./
RUN pnpm run build


FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PROJECT_GRAVEYARD_DATABASE_PATH=/data/project_graveyard.db

WORKDIR /app

COPY backend/requirements.txt /tmp/requirements.txt
RUN python -m pip install --no-cache-dir -r /tmp/requirements.txt \
    && groupadd --system app \
    && useradd --system --gid app --home-dir /app app

COPY backend/ ./backend/
COPY --from=frontend-build /build/frontend/dist ./frontend/dist/

RUN mkdir -p /data \
    && chown -R app:app /app /data

USER app
WORKDIR /app/backend

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD ["python", "-c", "from urllib.request import urlopen; urlopen('http://127.0.0.1:8000/api/health', timeout=3)"]

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

