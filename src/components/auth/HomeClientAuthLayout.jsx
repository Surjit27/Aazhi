import { Link } from 'react-router-dom'
import { BrandLockup } from '../ui/Brand.jsx'

export default function HomeClientAuthLayout({ title, subtitle, children, alternate }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-app-canvas p-6">
      <div className="mb-6 w-full max-w-md">
        <Link to="/" className="inline-flex opacity-90 transition-opacity hover:opacity-100">
          <BrandLockup className="h-9" iconSize={36} />
        </Link>
      </div>
      <div className="glass-card w-full max-w-md p-8 shadow-pop">
        <div className="mb-6 space-y-1">
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
          {subtitle ? <p className="text-xs text-ink-muted">{subtitle}</p> : null}
        </div>
        {children}
        {alternate ? <div className="mt-6 border-t border-line pt-4 text-center text-xs text-ink-muted">{alternate}</div> : null}
      </div>
    </div>
  )
}
