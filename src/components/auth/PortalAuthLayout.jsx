import { Link, useLocation } from 'react-router-dom'
import HomePageShell from '../home/HomePageShell.jsx'
import HomeProductRail from '../home/HomeProductRail.jsx'
import { BrandLockup } from '../ui/Brand.jsx'
import { adminAppOrigin, clientAppOrigin } from '../../lib/portal.js'

const COPY = {
  home: {
    login: {
      eyebrow: 'Client sign-in',
      headline: 'Sign in to deepe',
      subtitle:
        'Access reverse engineering, visual workflows, triggers, and the execution monitor on client.localhost.',
    },
    signup: {
      eyebrow: 'Client sign-up',
      headline: 'Create your client account',
      subtitle: 'Register on home.localhost — we open your client workspace when you are done.',
    },
  },
  client: {
    login: {
      eyebrow: 'Client sign-in',
      headline: 'Sign in to deepe',
      subtitle: 'Access reverse engineering, visual workflows, triggers, and the execution monitor on client.localhost.',
    },
  },
  admin: {
    login: {
      eyebrow: 'Admin sign-in',
      headline: 'Sign in to deepe',
      subtitle: 'Platform console for tenants, feature flags, and history on admin.localhost.',
    },
  },
}

export default function PortalAuthLayout({
  portal = 'client',
  mode = 'login',
  headline,
  subtitle,
  children,
  alternate,
  footerNote,
}) {
  const { pathname } = useLocation()
  const isLogin = mode === 'login'
  const portalCopy = COPY[portal]?.[mode] ?? COPY.client.login
  const railPortal = portal === 'home' ? 'client' : portal

  return (
    <HomePageShell>
      <header className="glass-bar border-b border-line/80 px-4 py-4 md:px-10">
        <div className="mx-auto flex max-w-[68rem] items-center justify-between">
          <Link to={portal === 'home' ? '/' : '/login'} className="home-reveal">
            <BrandLockup className="h-9 md:h-10" iconSize={36} />
          </Link>
          {portal === 'home' ? (
            <Link to="/" className="home-reveal text-sm text-ink-muted transition-colors hover:text-primary-600">
              Back to home
            </Link>
          ) : (
            <p className="home-reveal hidden text-xs text-ink-muted sm:block">
              <span className="font-mono">{portal === 'admin' ? adminAppOrigin() : clientAppOrigin()}</span>
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[68rem] flex-1 items-center px-4 py-12 sm:py-14 md:px-10 md:py-16 lg:min-h-[calc(100vh-5rem)] lg:py-20">
        <div className="home-auth-split grid w-full gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
          <div className="glass-card home-reveal home-auth-card-entrance shadow-pop md:p-11 lg:p-14 p-9 sm:p-10">
            <div key={pathname} className="home-auth-form-panel">
              <p className="home-section-eyebrow text-primary-600">{portalCopy.eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-[2.15rem] md:leading-tight">
                {headline ?? portalCopy.headline}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted md:text-[15px]">
                {subtitle ?? portalCopy.subtitle}
              </p>
              <div className="mt-9 md:mt-10">{children}</div>
              {alternate ? (
                <div className="mt-8 border-t border-line pt-6 text-center text-sm text-ink-muted md:text-[15px]">
                  {alternate}
                </div>
              ) : null}
              {footerNote ? <p className="mt-5 text-[11px] leading-relaxed text-ink-subtle">{footerNote}</p> : null}
            </div>
          </div>

          <div
            className="home-reveal home-auth-rail-entrance hidden min-h-[380px] md:block md:min-h-[440px] lg:min-h-[480px]"
            style={{ animationDelay: '120ms' }}
          >
            <HomeProductRail portal={railPortal} className="h-full min-h-[380px] md:min-h-[440px] lg:min-h-[480px]" />
          </div>
        </div>
      </div>
    </HomePageShell>
  )
}
