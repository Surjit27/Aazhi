# Deepe (Aazhi) — project & scope

**Deepe** is a multi-portal product for understanding and operating connected software backends: Git-linked **repo indexing**, **code / import graphs**, **workflow and job tooling**, and (via a Python worker) **LLM-assisted decode**. The public name is **Deepe**; GitHub repositories use the **Aazhi** naming prefix.

This document describes the **whole system** and the **scope of this repository** (the React frontend).

## Three repositories (no parent git repo)

The product is split across three independent repos. On disk they often live as siblings under a local folder (for example `Personal projects/Aazhi/`); there is **no** umbrella git repository—clone and version each repo separately.

| Repository | GitHub | Runtime | Default port |
|------------|--------|---------|--------------|
| **Frontend** (this repo) | [Surjit27/Aazhi](https://github.com/Surjit27/Aazhi) | React 18 + Vite | 5173 |
| **Node backend** | [Surjit27/Aazhi-js-backend](https://github.com/Surjit27/Aazhi-js-backend) | Express + Prisma | 4000 |
| **Python backend** | [Surjit27/Deepe-agent-backend](https://github.com/Surjit27/Deepe-agent-backend) | FastAPI (internal) | 4100 |

Related docs in the other repos:

- Node: `backend/docs/PROJECT_AND_SCOPE.md` and `backend/README.md`
- Python: `Python-backend/docs/PROJECT_AND_SCOPE.md`, `Python-backend/docs/SCHEMA_ARCHITECTURE.md`

## System architecture (high level)

```text
                    ┌─────────────────────────────────────┐
                    │  Browsers (hostname-based portals)   │
                    │  home · client · admin @ :5173      │
                    └──────────────────┬──────────────────┘
                                       │ HTTPS / JSON + JWT
                                       ▼
                    ┌─────────────────────────────────────┐
                    │  Node API (Aazhi-js-backend)        │
                    │  Auth, portal data, job orchestration │
                    │  Postgres public · Mongo · Redis    │
                    └──────────┬─────────────┬────────────┘
                               │ BullMQ      │ Internal HTTP
                               ▼             ▼
                    ┌──────────────┐  ┌─────────────────────┐
                    │ Redis        │  │ Python-backend      │
                    │ job queues   │  │ Index / graph / LLM │
                    └──────────────┘  │ Postgres ai schema  │
                                      │ Mongo ai_* docs     │
                                      └─────────────────────┘
```

**Source of truth for the client UI** (users, backends registry, index run status, merged graphs) lives in the **Node** layer (`public` PostgreSQL schema). Python holds **worker state** and returns **versioned JSON contracts** (`GraphSnapshot`, job payloads); it does not issue portal JWTs.

## This repo: Frontend — responsibilities

### In scope

- **Single Vite build**, three **hostname portals** (`home`, `client`, `admin`) via `lib/portal.js` and `X-App-Surface` alignment with the API.
- **Home**: marketing / sign-up and sign-in entry.
- **Client**: dashboards, **Deep** surfaces (projects, explorer, flow studio, scheduler), **backend registry** and per-backend **explorer / workflow**, integrations (GitHub, cloud placeholders), access management, history, settings.
- **Admin**: tenant user management, roles, audit/history views, email and API token settings, feature flags.
- UI state (e.g. Zustand), React Flow graphs, Monaco-backed code views, and API clients in `src/services/`.
- CORS/dev assumption: API at `http://localhost:4000` unless configured otherwise.

### Out of scope (belongs in other repos)

- Authentication token issuance, password hashing, Prisma migrations → **Node backend**.
- Git clone, static indexing, LLM decode, `ai` schema tables → **Python backend**.
- Long-running job execution and SendGrid delivery → **Node backend** (BullMQ worker in API process).

### Local dev (this repo)

```bash
cd Frontend
npm install
npm run dev
```

Use **http://home.localhost:5173**, **http://client.localhost:5173**, and **http://admin.localhost:5173** (map hosts in `/etc/hosts`). Plain `http://localhost:5173` redirects to the client portal.

Start the Node API first (`backend/docker compose up` or `npm run dev` in `backend/`). Python is required only for full **AI index/decode** flows, not for basic portal login and CRUD.

## Product scope (cross-cutting)

### Currently implemented / active themes

- Portal auth with **role + surface** enforcement (client vs admin).
- **Explorer** and **repo index** UX wired to Node APIs (status polling, GitHub token errors, folder/import map layouts).
- Admin **email (SendGrid)** settings and delivery hints; **job triggers** and history APIs.
- Python worker **scaffold** and schema split documented; Node triggers `index-backend` jobs toward Python where integrated.

### Planned / in progress (not exhaustive)

- Persisting canonical **graph tables** in `public` after Python returns `GraphSnapshot`.
- Deeper **LLM decode** passes and assistant RAG over Mongo `ai_*` collections.
- Replacing explorer **localStorage** prototypes with API-backed **projects** where migrations exist on Node.

### Explicit non-goals (for now)

- One monorepo containing all three runtimes.
- Python handling browser login or storing long-lived LLM keys in `ai` tables (keys stay in Node/`public`, short-lived per job).
- A separate PostgreSQL **database** for AI (prefer single DB, **`ai` schema**—see Python `docs/SCHEMA_ARCHITECTURE.md`).

## How to work across repos

1. Schema or API contract change → update **Node** routes/Prisma and/or **Python** `app/contracts/`, then adjust **Frontend** services and types.
2. New client-only business tables → Node `clientSchema` SQL migrations, not Prisma multi-tenant physical tables per client.
3. Keep **OpenAPI** at `http://localhost:4100/openapi.json` in mind when extending index/decode payloads.

## Documentation map

| Document | Where |
|----------|--------|
| **Project & scope** (this file) | `docs/PROJECT_AND_SCOPE.md` in each of the three repos |
| **Postgres / Mongo split, job handoff** | `Python-backend/docs/SCHEMA_ARCHITECTURE.md` |
| **Runbooks** | Each repo’s `README.md` |

When system scope changes, update the matching sections in **all three** `PROJECT_AND_SCOPE.md` copies and bump the *Last updated* line below.

## Local Git identity (Aazhi clones only)

The three repos are often siblings under one folder (for example `Personal projects/Aazhi/`). Use **repo-local** Git config in each clone so other folders on the machine keep their own `user.name` / `user.email`:

```bash
cd Frontend   # repeat in backend/ and Python-backend/
git config user.name "Surjit27"
git config user.email "billionfolds@gmail.com"
```

This does **not** modify global Git configuration.

---

*Last updated: 2026-11-25 — keep in sync with sibling copies in `backend/docs/` and `Python-backend/docs/` when system scope changes.*