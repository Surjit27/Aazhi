import { Navigate } from 'react-router-dom'
import { getPortal, homePathForPortal, portalForRole, redirectToAdmin, redirectToClient } from '../../lib/portal.js'
import { useAuthStore } from '../../stores/authStore.js'

export default function HomeRedirect() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

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

  return <Navigate to={homePathForPortal(portal)} replace />
}
