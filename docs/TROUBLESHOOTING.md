# Frontend troubleshooting

Common issues when running the Deepe client portals locally.

## Portal hostname does not load

The app expects **hostname-based portals**, not only `localhost`.

1. Add entries to `/etc/hosts` (or use a DNS hook your OS supports):

   ```text
   127.0.0.1 home.localhost client.localhost admin.localhost
   ```

2. Open **http://client.localhost:5173** (not `http://127.0.0.1:5173` unless redirects are configured).

3. Plain `http://localhost:5173` should redirect to the client surface; if it does not, confirm `vite.config.js` dev server host settings.

## API errors or CORS in the browser

1. Start the **Node API** on port **4000** before exercising authenticated routes.
2. Confirm `VITE_API_URL` (or your env equivalent in `.env`) points at `http://localhost:4000`.
3. Match **surface** headers: client routes send `X-App-Surface: client`; admin routes use `admin`.

## Feature flags hide sidebar items

Client nav respects flags from `GET /api/client/feature-flags`. If routes disappear:

1. Sign in on **client.localhost** (not home/admin).
2. In admin, open **Settings → Feature flags** and enable the nav path or flag key.
3. Hard-refresh the client portal after saving.

## Blank page after route change (lazy chunks)

Routes use `React.lazy`. A failed dynamic import usually means a stale Vite HMR bundle—restart `npm run dev` and hard-refresh. Check the browser console for `Failed to fetch dynamically imported module`.

## Two-factor login loops

If login succeeds but returns to the form, complete **Settings → Security → Two-factor** or use the pending login code screen. Clear `localStorage` auth keys only as a last resort (`deepe.auth.token`).

## Explorer / index stuck on “pending”

Full index flows need **Redis**, **Postgres**, and the **Python worker** (4100). Without Python, Node may enqueue jobs but never receive `GraphSnapshot` payloads—check Node logs and `Python-backend/docs/TROUBLESHOOTING.md`.

## Related docs

- [PROJECT_AND_SCOPE.md](./PROJECT_AND_SCOPE.md) — what this repo owns
- `backend/docs/TROUBLESHOOTING.md` — API and Docker
- `Python-backend/docs/TROUBLESHOOTING.md` — internal worker

*Last updated: 2026-11-28*