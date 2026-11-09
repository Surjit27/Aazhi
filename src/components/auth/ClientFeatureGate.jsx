import { Outlet } from 'react-router-dom'

/** Placeholder route wrapper — feature-flag gating removed until reintroduced. */
export default function ClientFeatureGate() {
  return <Outlet />
}
