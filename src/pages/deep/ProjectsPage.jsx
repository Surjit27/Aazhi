import { Navigate } from 'react-router-dom'

/** Projects are managed inside Backend Explorer. */
export default function ProjectsPage() {
  return <Navigate to="/deep/explorer" replace />
}
