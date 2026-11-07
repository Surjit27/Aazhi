import { Link, useLocation } from 'react-router-dom'
import HomePageShell from '../home/HomePageShell.jsx'
import HomeProductRail from '../home/HomeProductRail.jsx'
import { BrandLockup } from '../ui/Brand.jsx'

export default function HomeClientAuthLayout({ mode = 'login', headline, subtitle, children, alternate }) {
  const { pathname } = useLocation()
  const isLogin = mode === 'login'
  const defaultHeadline = isLogin ? 'Sign in to deepe' : 'Create your client account'
  const defaultSubtitle = isLogin
    ? 'Access reverse engineering, visual workflows, triggers, and the execution monitor on client.localhost.'
    : 'Register on home.localhost — we open your client workspace when you are done.'

  return (
    <HomePageShell>
      <header className="glass-bar border-b border-line/80 px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/">
            <BrandLockup className="h-8" iconSize={32} />
          </Link>
          <Link to="/" className="text-sm text-ink-muted hover:text-primary-600">
            Back to home
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-10 md:px-8 md:py-14">
        <div className="home-auth-split grid w-full gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
          <div className="glass-card home-reveal p-8 shadow-card md:p-10">
            <div key={pathname} className="home-auth-form-panel">
              <p className="home-section-eyebrow text-ink-subtle">{isLogin ? 'Client sign-in' : 'Client sign-up'}</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink md:text-[1.65rem]">
                {headline ?? defaultHeadline}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subtitle ?? defaultSubtitle}</p>
              <div className="mt-8">{children}</div>
              {alternate ? <div className="mt-6 border-t border-line pt-5 text-center text-sm text-ink-muted">{alternate}</div> : null}
            </div>
          </div>

          <div className="home-reveal hidden min-h-[340px] lg:block" style={{ animationDelay: '120ms' }}>
            <HomeProductRail className="h-full min-h-[340px]" />
          </div>
        </div>
      </div>
    </HomePageShell>
  )
}
