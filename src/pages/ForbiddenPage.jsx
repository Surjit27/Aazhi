import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { getPortal, homePathForPortal, loginPathForPortal } from '../lib/portal.js'
import { useAuthStore } from '../stores/authStore.js'

export default function ForbiddenPage() {
  const user = useAuthStore((s) => s.user)
  const portal = getPortal()
  const home = homePathForPortal(portal)

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-app-canvas p-6">
      <div className="glass-card home-auth-card home-auth-card--compact w-full max-w-md text-center shadow-pop">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-50 text-warning-700">
          <ShieldAlert size={24} />
        </div>
        <h1 className="text-[1.75rem] font-semibold leading-tight text-ink md:text-[2.15rem]">Access denied</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted md:text-[15px]">
          {user
            ? `Your account is a ${user.role} user. This hostname is the ${portal} portal — sign in with the matching role on the correct URL.`
            : 'You do not have permission to view this page.'}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {user ? (
            <Link
              to={home}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-primary-600 bg-primary-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 md:text-[15px]"
            >
              Go to portal home
            </Link>
          ) : (
            <a
              href={loginPathForPortal(portal)}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border border-primary-600 bg-primary-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-700 md:text-[15px]"
            >
              Sign in
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
