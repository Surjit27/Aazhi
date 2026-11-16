import { getPortal, PORTAL } from './portal.js'
import { TOKEN_STORAGE_KEYS } from './tokenStorage.js'

export function apiAppSurface() {
  const portal = getPortal()
  if (portal === PORTAL.ADMIN) return PORTAL.ADMIN
  if (portal === PORTAL.HOME) return PORTAL.HOME
  return PORTAL.CLIENT
}

/** Empty = same-origin `/api` via Vite proxy (home / client / admin *.localhost). */
const API_BASE = import.meta.env.VITE_API_URL ?? ''

function storageKey() {
  return getPortal() === PORTAL.ADMIN ? TOKEN_STORAGE_KEYS.ADMIN : TOKEN_STORAGE_KEYS.CLIENT
}

/** Admin and client keep different tokens. Impersonation stays in this tab only. */
export function getStoredToken() {
  const key = storageKey()
  const isolated = sessionStorage.getItem(key)
  if (isolated) return isolated
  const saved = localStorage.getItem(key)
  if (saved) return saved
  const legacy = localStorage.getItem(TOKEN_STORAGE_KEYS.LEGACY)
  if (!legacy) return null
  localStorage.setItem(key, legacy)
  localStorage.removeItem(TOKEN_STORAGE_KEYS.LEGACY)
  return legacy
}

export function setStoredToken(token, { isolated = false } = {}) {
  const key = storageKey()
  sessionStorage.removeItem(key)
  if (isolated) {
    if (token) sessionStorage.setItem(key, token)
    return
  }
  if (token) localStorage.setItem(key, token)
  else localStorage.removeItem(key)
  localStorage.removeItem(TOKEN_STORAGE_KEYS.LEGACY)
}

/** Clears the session this tab is using. An impersonation tab does not sign out the real client. */
export function clearStoredToken() {
  const key = storageKey()
  if (sessionStorage.getItem(key)) {
    sessionStorage.removeItem(key)
    return
  }
  localStorage.removeItem(key)
  localStorage.removeItem(TOKEN_STORAGE_KEYS.LEGACY)
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json', 'X-App-Surface': apiAppSurface() }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getStoredToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      const err = new Error('Server returned invalid JSON')
      err.status = res.status
      throw err
    }
  }

  if (!res.ok) {
    const err = new Error(data?.error ?? res.statusText)
    err.status = res.status
    throw err
  }
  return data
}
