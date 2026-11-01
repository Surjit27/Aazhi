import { Navigate } from 'react-router-dom'
import { getAppSurface, redirectToAdmin, redirectToClient } from '../../lib/appHost.js'
import { useAuthStore } from '../../stores/authStore.js'
import SettingsPage from '../../pages/SettingsPage.jsx'

export default function SettingsRoute() {
  const user = useAuthStore((s) => s.user)
  const surface = getAppSurface()

  if (!user) return <Navigate to="/login" replace />

  if (surface === 'admin') {
    if (user.role !== 'admin') {
      redirectToClient('/client')
      return null
    }
    return <SettingsPage />
  }

  if (user.role !== 'client') {
    redirectToAdmin('/overview')
    return null
  }
  return <SettingsPage />
}
