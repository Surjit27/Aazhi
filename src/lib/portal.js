/**
 * Two portals, one app build (Ad-portal pattern, simplified):
 * - admin.localhost → admin portal (role must be `admin`)
 * - localhost       → client portal (role must be `client`)
 */
import {
  adminAppOrigin,
  clientAppOrigin,
  getAppSurface,
  homePathForRole,
  redirectToAdmin,
  redirectToClient,
} from './appHost.js'

export const PORTAL = {
  ADMIN: 'admin',
  CLIENT: 'client',
}

export const ROLE = {
  ADMIN: 'admin',
  CLIENT: 'client',
}

/** Same as getAppSurface(); named for parity with Ad-portal `getHostApp()`. */
export function getPortal() {
  return getAppSurface()
}

export function portalForRole(role) {
  return role === ROLE.ADMIN ? PORTAL.ADMIN : PORTAL.CLIENT
}

export function roleForPortal(portal) {
  return portal === PORTAL.ADMIN ? ROLE.ADMIN : ROLE.CLIENT
}

export function homePathForPortal(portal = getPortal()) {
  return portal === PORTAL.ADMIN ? '/overview' : '/mocks'
}

/** Client hostname must not render admin screens or the orders service. */
export function isClientBlockedPath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/overview' || path === '/roles') return true
  if (path === '/admin' || path.startsWith('/admin/')) return true
  if (path === '/backends/orders' || path.startsWith('/backends/orders/')) return true
  return false
}

export function loginPathForPortal(portal = getPortal()) {
  const origin = portal === PORTAL.ADMIN ? adminAppOrigin() : clientAppOrigin()
  return `${origin}/login`
}

/** Role must match the hostname portal (no per-feature permissions). */
export function isRoleAllowedOnPortal(role, portal = getPortal()) {
  if (!role) return false
  return portalForRole(role) === portal
}

export {
  adminAppOrigin,
  clientAppOrigin,
  getAppSurface,
  homePathForRole,
  redirectToAdmin,
  redirectToClient,
}
