import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/** Return to Settings → Integrations list. */
export default function SettingsBackLink({ integration = 'email' }) {
  const to = integration === 'api' ? '/settings/api' : '/settings/email'
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:underline"
    >
      <ArrowLeft size={14} aria-hidden />
      Back to Settings
    </Link>
  )
}