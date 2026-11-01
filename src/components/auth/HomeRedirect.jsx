import { Navigate } from 'react-router-dom'
import { getAppSurface, homePathForRole, redirectToAdmin, redirectToClient } from '../../lib/appHost.js'
import { useAuthStore } from '../../stores/authStore.js'

export default function HomeRedirect() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  const surface = getAppSurface()
  if (user.role === 'admin' && surface !== 'admin') {
    redirectToAdmin(homePathForRole('admin'))
    return null
  }
  if (user.role === 'client' && surface !== 'client') {
    redirectToClient('/client')
    return null
  }

  return <Navigate to={homePathForRole(user.role)} replace />
}
