/** Which UI surface this hostname serves. */
export function getAppSurface() {
  const host = window.location.hostname.toLowerCase()
  if (host === 'admin.localhost' || host.startsWith('admin.')) return 'admin'
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
  return `${window.location.protocol}//admin.localhost${portSuffix()}`
}

export function clientAppOrigin() {
  return `${window.location.protocol}//localhost${portSuffix()}`
}

export function redirectToAdmin(path = '/login') {
  window.location.assign(`${adminAppOrigin()}${path}`)
}

export function redirectToClient(path = '/login') {
  window.location.assign(`${clientAppOrigin()}${path}`)
}

export function homePathForRole(role) {
  return role === 'admin' ? '/overview' : '/client'
}

export function loginPathForSurface(surface = getAppSurface()) {
  return surface === 'admin' ? `${adminAppOrigin()}/login` : `${clientAppOrigin()}/login`
}
