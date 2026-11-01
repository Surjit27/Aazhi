import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore.js'

export default function RoleGate({ allow }) {
  const user = useAuthStore((s) => s.user)

  if (!user) return <Navigate to="/login" replace />

  if (allow === 'admin' && user.role !== 'admin') {
    return <Navigate to="/client" replace />
  }
  if (allow === 'client' && user.role !== 'client') {
    return <Navigate to="/overview" replace />
  }

  return <Outlet />
}
