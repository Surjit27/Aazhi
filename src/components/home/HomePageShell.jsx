import HomeAnimatedBackdrop from './HomeAnimatedBackdrop.jsx'

/** Wraps home marketing / auth pages: dot canvas + animated layers + stacked content. */
export default function HomePageShell({ children, className = '' }) {
  return (
    <div className={`home-bg-shell flex min-h-full flex-col bg-app-canvas ${className}`}>
      <HomeAnimatedBackdrop />
      <div className="relative z-[1] flex min-h-full flex-1 flex-col">{children}</div>
    </div>
  )
}
