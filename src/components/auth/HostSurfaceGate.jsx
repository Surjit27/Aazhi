import { Outlet } from 'react-router-dom'
import { getPortal, homePathForPortal, portalForRole, redirectToAdmin, redirectToClient } from '../../lib/portal.js'
import { useAuthStore } from '../../stores/authStore.js'

/** After login, send users to the correct origin if role and hostname disagree. */
export function HostRoleSync() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Outlet />

  const portal = getPortal()
  const userPortal = portalForRole(user.role)

  if (userPortal !== portal) {
    if (userPortal === 'admin') {
      redirectToAdmin(homePathForPortal('admin'))
    } else {
      redirectToClient(homePathForPortal('client'))
    }
    return null
  }

  return <Outlet />
}
