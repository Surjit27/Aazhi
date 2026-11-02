import { getPortal } from './portal.js'

/** Empty = same-origin `/api` via Vite proxy (recommended for localhost + admin.localhost). */
const API_BASE = import.meta.env.VITE_API_URL ?? ''

export function getStoredToken() {
  return localStorage.getItem('aazhi_token')
}

export function setStoredToken(token) {
  if (token) localStorage.setItem('aazhi_token', token)
  else localStorage.removeItem('aazhi_token')
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json', 'X-App-Surface': getPortal() }
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
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const err = new Error(data?.error ?? res.statusText)
    err.status = res.status
    throw err
  }
  return data
}
