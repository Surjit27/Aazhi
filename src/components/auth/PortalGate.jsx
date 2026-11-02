import { Navigate, Outlet } from 'react-router-dom'
import { getPortal, isRoleAllowedOnPortal } from '../../lib/portal.js'
import { useAuthStore } from '../../stores/authStore.js'

/**
 * Ensures JWT role matches the hostname portal (admin vs client only).
 * Cross-host mismatches are handled by HostRoleSync before this runs.
 */
export default function PortalGate() {
  const user = useAuthStore((s) => s.user)
  const portal = getPortal()

  if (user && !isRoleAllowedOnPortal(user.role, portal)) {
    return <Navigate to="/forbidden" replace />
  }

  return <Outlet />
}
