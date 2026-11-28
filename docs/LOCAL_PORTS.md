# Local ports (Deepe stack)

| Service | Default port | Health / docs |
|---------|--------------|---------------|
| Vite dev server | 5173 | http://client.localhost:5173 |
| Vite preview | 4173 | `npm run preview` |
| Node API | 4000 | http://localhost:4000/health |
| Python worker | 4100 | http://localhost:4100/health |
| Postgres (host) | 5433 | via `backend` Docker Compose |
| Redis | 6379 | BullMQ |
| MongoDB | 27017 | snapshots / snippets |

Keep `.env` in Frontend, `backend`, and `Python-backend` aligned on these values.

*Last updated: 2026-11-28*