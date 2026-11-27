/** Labels for permission keys returned by the API catalog. */
export const ADMIN_PERMISSION_LABELS = {
  overview: 'Overview',
  roles: 'Roles',
  client_users: 'Client user management',
  admin_users: 'Admin user management',
  history: 'History',
  settings: 'Settings',
  'settings.email': 'Settings — Email',
  'settings.api': 'Settings — API model',
  'settings.feature_flags': 'Settings — Feature flags',
}

export const CLIENT_PERMISSION_LABELS = {
  dashboard: 'Dashboards',
  deep_backend: 'Deep Backend',
  'access.users': 'Access — Users',
  'access.roles': 'Access — Roles',
  history: 'History',
  settings: 'Settings',
}

export function permissionLabel(portal, key) {
  const map = portal === 'admin' ? ADMIN_PERMISSION_LABELS : CLIENT_PERMISSION_LABELS
  return map[key] || key
}

export function summarizePermissions(portal, permissions = []) {
  if (!permissions.length) return 'None'
  const preview = permissions.slice(0, 2).map((k) => permissionLabel(portal, k))
  if (permissions.length <= 2) return preview.join(', ')
  return `${preview.join(', ')} +${permissions.length - 2}`
}