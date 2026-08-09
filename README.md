# Project Graveyard

Project Graveyard is a small, local, single-user application for keeping track of coding projects that are active, paused, abandoned, or completed. It uses FastAPI and SQLite for the local API and React with Vite for the interface.

## Self-host with Docker

Docker Compose is the simplest way to run the complete application. From the project root:

```bash
docker compose up --build -d
```

Open [http://localhost:8000](http://localhost:8000). The SQLite database is stored in the named `project-graveyard-data` volume and survives container updates and restarts.

Useful commands:

```bash
# Follow application logs
docker compose logs -f

# Stop the application without deleting its data
docker compose down

# Rebuild and restart after pulling an update
docker compose up --build -d
```

To use a different host port:

```bash
PROJECT_GRAVEYARD_PORT=8080 docker compose up --build -d
```

Then open `http://localhost:8080`.

Project Graveyard intentionally has no authentication. Keep it on a trusted local network, or put it behind an access-controlled reverse proxy or VPN before exposing it to the public internet.

## Requirements

- Python 3.10 or newer
- Node.js 22 or newer
- pnpm 11 or newer

## First-time setup

Run these commands from the project root:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
cd frontend
pnpm install
pnpm run build
cd ..
```

## Start the application

The production build is served by FastAPI, so only one local process is needed:

```bash
cd backend
../.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a browser. Stop the application with `Ctrl+C`.

## Development mode

Run the backend in one terminal:

```bash
cd backend
../.venv/bin/python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Run the frontend in a second terminal:

```bash
cd frontend
pnpm run dev
```

Then open [http://127.0.0.1:5173](http://127.0.0.1:5173). Vite forwards `/api` requests to the local backend.

## Local data

Project data is stored in `backend/project_graveyard.db`. The app creates several example projects only when that database is empty.

When running with Docker Compose, the database is stored in the `project-graveyard-data` volume instead. The backend also accepts a custom database location through the `PROJECT_GRAVEYARD_DATABASE_PATH` environment variable.
