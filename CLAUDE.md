# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Monorepo (Root)
- `pnpm dev`: Run development tasks (primarily frontend)
- `pnpm build`: Build all packages
- `pnpm lint`: Lint all packages
- `pnpm lint:fix`: Fix linting issues and format code
- `pnpm typecheck`: Run TypeScript type checking across the monorepo
- `pnpm format`: Format all files using Prettier
- `pnpm format:check`: Check if files are formatted correctly

### Frontend (`apps/frontend`)
- `pnpm --filter @poker/frontend dev`: Start frontend development server
- `pnpm --filter @poker/frontend build`: Build frontend for production
- `pnpm --filter @poker/frontend preview`: Preview production build

### Backend (`apps/backend`)
- Setup: `cd apps/backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`
- Run: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Migrations: `alembic upgrade head`

### Docker
- `docker compose up`: Start all services (Backend, Frontend, Postgres, Redis)
- `docker compose down`: Stop all services
- `docker compose down -v`: Stop services and remove volumes

## Architecture

### Project Structure
The project is a monorepo managed by Turbo and pnpm.
- `apps/backend`: Python FastAPI application.
- `apps/frontend`: React application using Vite and TypeScript.
- `packages/shared`: Shared TypeScript types and utilities.
- `infrastructure/`: Docker and deployment configurations.

### Backend Architecture (FastAPI)
The backend follows a layered architecture:
- **API Routes** (`app/api/routes/`): REST endpoints and WebSocket handlers.
- **Services** (`app/services/`): Business logic for rooms, voting, and authentication.
- **Repositories** (`app/repositories/`): Data access layer using SQLAlchemy.
- **Models** (`app/models/`): SQLAlchemy ORM models.
- **Schemas** (`app/schemas/`): Pydantic models for request/response validation.
- **Core** (`app/core/`): Configuration, security (JWT), and dependencies.
- **WebSocket** (`app/websocket/`): Connection management and event broadcasting.

### Frontend Architecture (React)
The frontend implements **Feature-Sliced Design (FSD)**:
- `app/`: Global initialization, providers, and routing.
- `pages/`: Page-level components and data fetching.
- `widgets/`: Complex UI blocks composed of features and entities.
- `features/`: User-facing actions (e.g., `voting`, `auth`, `join-room`).
- `entities/`: Domain entities (e.g., `room`, `user`) with their own API, model, and UI.
- `shared/`: Generic reusable components, API clients, and utility functions.

### Key Technologies
- **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS, TanStack Query, Zustand, React Router.
- **Backend**: Python 3.13, FastAPI, PostgreSQL, SQLAlchemy 2.0, Alembic, Redis.
- **Communication**: REST for stateful operations, WebSockets for real-time synchronization.
