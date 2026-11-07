export const HOST = {
  HOME: 'home.localhost',
  CLIENT: 'client.localhost',
  ADMIN: 'admin.localhost',
}

function isHomeHostname(host) {
  return host === HOST.HOME || host.startsWith('home.')
}

function isClientHostname(host) {
  return host === HOST.CLIENT || host.startsWith('client.')
}

/** Which UI surface this hostname serves. */
export function getAppSurface() {
  const host = window.location.hostname.toLowerCase()
  if (host === HOST.ADMIN || host.startsWith('admin.')) return 'admin'
  if (isHomeHostname(host)) return 'home'
  if (isClientHostname(host) || host === 'localhost' || host === '127.0.0.1') return 'client'
  return 'client'
}

export function isAdminHost() {
  return getAppSurface() === 'admin'
}

function portSuffix() {
  const { protocol, port } = window.location
  if (!port || (protocol === 'http:' && port === '80') || (protocol === 'https:' && port === '443')) {
    return ''
  }
  return `:${port}`
}

export function adminAppOrigin() {
  return `${window.location.protocol}//${HOST.ADMIN}${portSuffix()}`
}

export function clientAppOrigin() {
  return `${window.location.protocol}//${HOST.CLIENT}${portSuffix()}`
}

export function homeAppOrigin() {
  return `${window.location.protocol}//${HOST.HOME}${portSuffix()}`
}

/** Legacy `localhost` / `127.0.0.1` → `client.localhost` (same path). */
export function redirectBareLocalhostToClient() {
  const host = window.location.hostname.toLowerCase()
  if (host !== 'localhost' && host !== '127.0.0.1') return false
  const { protocol, port, pathname, search, hash } = window.location
  const portPart = port ? `:${port}` : ''
  window.location.replace(`${protocol}//${HOST.CLIENT}${portPart}${pathname}${search}${hash}`)
  return true
}

export function redirectToAdmin(path = '/login') {
  window.location.assign(`${adminAppOrigin()}${path}`)
}

export function redirectToClient(path = '/login') {
  window.location.assign(`${clientAppOrigin()}${path}`)
}

export function homePathForRole(role) {
  return role === 'admin' ? '/overview' : '/backends/overview'
}

export function loginPathForSurface(surface = getAppSurface()) {
  if (surface === 'admin') return `${adminAppOrigin()}/login`
  if (surface === 'home') return `${homeAppOrigin()}/login`
  return `${clientAppOrigin()}/login`
}
