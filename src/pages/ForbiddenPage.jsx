import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { getPortal, homePathForPortal, loginPathForPortal } from '../lib/portal.js'
import { useAuthStore } from '../stores/authStore.js'

export default function ForbiddenPage() {
  const user = useAuthStore((s) => s.user)
  const portal = getPortal()
  const home = homePathForPortal(portal)

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-xl border border-line bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-50 text-warning-700">
          <ShieldAlert size={24} />
        </div>
        <h1 className="text-lg font-semibold text-ink">Access denied</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {user
            ? `Your account is a ${user.role} user. This hostname is the ${portal} portal — sign in with the matching role on the correct URL.`
            : 'You do not have permission to view this page.'}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {user ? (
            <Link
              to={home}
              className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-primary-600 bg-primary-600 px-3 text-[13px] font-medium text-white shadow-sm hover:bg-primary-700"
            >
              Go to portal home
            </Link>
          ) : (
            <a
              href={loginPathForPortal(portal)}
              className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-primary-600 bg-primary-600 px-3 text-[13px] font-medium text-white shadow-sm hover:bg-primary-700"
            >
              Sign in
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
