import { Navigate } from 'react-router-dom'
import { getPortal, homePathForPortal, portalForUser, redirectToAdmin, redirectToClient, PORTAL } from '../../lib/portal.js'
import { CLIENT_NAV } from '../../routes/index.jsx'
import { useAuthStore } from '../../stores/authStore.js'
import { useFeatureFlagsStore } from '../../stores/featureFlagsStore.js'

export default function HomeRedirect() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  const portal = getPortal()
  const userPortal = portalForUser(user)

  if (userPortal !== portal) {
    if (userPortal === 'admin') {
      redirectToAdmin(homePathForPortal('admin'))
    } else {
      redirectToClient(homePathForPortal('client'))
    }
    return null
  }

  if (portal === PORTAL.CLIENT) {
    const target = useFeatureFlagsStore.getState().firstEnabledClientPath(CLIENT_NAV)
    return <Navigate to={target} replace />
  }

  return <Navigate to={homePathForPortal(portal)} replace />
}
