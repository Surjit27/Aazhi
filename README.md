# Deepe · Frontend (Aazhi)

React + Vite UI for **Deepe**: multi-hostname portals (**home**, **client**, **admin**) over a single build. Talks to the [Node API](https://github.com/Surjit27/Aazhi-js-backend); AI index/decode is orchestrated by Node via [Python-backend](https://github.com/Surjit27/Deepe-agent-backend).

**Project scope and three-repo layout:** [docs/PROJECT_AND_SCOPE.md](docs/PROJECT_AND_SCOPE.md)  
**Local dev issues:** [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## Local dev

```bash
npm install
npm run dev
```

| Host | Purpose |
|------|---------|
| http://home.localhost:5173 | Public marketing, sign-up / sign-in |
| http://client.localhost:5173 | Client portal (explorer, backends, Deep) |
| http://admin.localhost:5173 | Admin portal (users, settings, history) |

Add to `/etc/hosts` if needed:

```text
127.0.0.1 home.localhost client.localhost admin.localhost
```

Plain `http://localhost:5173` redirects to **client** host.

API default: `http://localhost:4000` (start `backend/` first).

## Stack

React 18, React Router 7, Tailwind 4, Zustand, React Flow (`@xyflow/react`), Monaco, Recharts.