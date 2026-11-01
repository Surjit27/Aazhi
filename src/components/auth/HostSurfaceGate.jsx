import { Navigate, Outlet } from 'react-router-dom'
import { getAppSurface, redirectToAdmin, redirectToClient } from '../../lib/appHost.js'
import { useAuthStore } from '../../stores/authStore.js'

/** Ensures admin routes only render on admin.localhost and client routes on localhost. */
export default function HostSurfaceGate({ surface }) {
  const current = getAppSurface()

  if (surface === 'admin' && current !== 'admin') {
    redirectToAdmin('/login')
    return null
  }
  if (surface === 'client' && current !== 'client') {
    redirectToClient('/login')
    return null
  }

  return <Outlet />
}

/** After login, send users to the correct origin if role and hostname disagree. */
export function HostRoleSync() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Outlet />

  const current = getAppSurface()
  if (user.role === 'admin' && current !== 'admin') {
    redirectToAdmin('/overview')
    return null
  }
  if (user.role === 'client' && current !== 'client') {
    redirectToClient('/client')
    return null
  }

  return <Outlet />
}
