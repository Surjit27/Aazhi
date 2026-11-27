import { Link } from 'react-router-dom'
import { adminAppOrigin, clientAppOrigin, homeAppOrigin } from '../../lib/appHost.js'
import { BRAND_NAME, BrandLockup } from '../ui/Brand.jsx'

const PRODUCT_LINKS = [
  { href: '#features', label: 'Product tour' },
  { href: '#platform', label: 'Automation pipeline' },
  { href: '#portals', label: 'Hostname portals' },
]

const HOST_LINKS = [
  { label: 'Marketing & auth', href: homeAppOrigin, path: '/' },
  { label: 'Client workspace', href: clientAppOrigin, path: '/login' },
  { label: 'Admin console', href: adminAppOrigin, path: '/login' },
]

export default function HomeSiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="home-site-footer border-t border-line bg-white/85 backdrop-blur-md">
      <div className="home-content-shell px-4 py-12 md:px-8 md:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <BrandLockup className="h-9" iconSize={34} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              Reverse-engineer live backends, design workflows, and monitor runs in one workspace.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">Product</h2>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="text-sm text-ink-muted transition-colors hover:text-primary-600">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">Hosts</h2>
            <ul className="mt-4 space-y-2.5">
              {HOST_LINKS.map(({ label, href, path }) => (
                <li key={label}>
                  <a href={`${href()}${path}`} className="text-sm text-ink-muted transition-colors hover:text-primary-600">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">Account</h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/login" className="text-sm text-ink-muted transition-colors hover:text-primary-600">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm text-ink-muted transition-colors hover:text-primary-600">
                  Create client account
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-line/80 pt-6 text-[11px] text-ink-subtle sm:flex-row sm:items-center">
          <p>
            © {year} {BRAND_NAME}. All rights reserved.
          </p>
          <p className="font-mono text-[10px] md:text-[11px]">home.localhost · client.localhost · admin.localhost</p>
        </div>
      </div>
    </footer>
  )
}