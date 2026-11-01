import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore.js'

export default function RequireAuth({ roles }) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-sm text-ink-muted">
        Checking session…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles?.length && !roles.includes(user.role)) {
    const fallback = user.role === 'admin' ? '/backends' : '/client'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
