/** Client workspace access roles (tenant `client_*` schema). */
export const ACCESS_ROLE = {
  SUPER_ADMIN: 'super_admin',
  MEMBER: 'member',
}

export function formatAccessRoleLabel(accessRoleKey) {
  if (accessRoleKey === ACCESS_ROLE.SUPER_ADMIN) return 'Super admin'
  if (accessRoleKey === ACCESS_ROLE.MEMBER) return 'Member'
  return accessRoleKey || 'Member'
}

/** New client sign-ups default to super admin when `accessRoleKey` is unset. */
export function isSuperAdminUser(user) {
  return user?.accessRoleKey === ACCESS_ROLE.SUPER_ADMIN || !user?.accessRoleKey
}

export function accessRoleBadgeTone(accessRoleKey) {
  return accessRoleKey === ACCESS_ROLE.SUPER_ADMIN ? 'primary' : 'neutral'
}