/** Subtle theme-aligned motion behind home + auth (CSS-only). */
export default function HomeAnimatedBackdrop() {
  return (
    <div className="home-bg-animated" aria-hidden>
      <div className="home-bg-mesh" />
      <span className="home-bg-orb home-bg-orb--primary" />
      <span className="home-bg-orb home-bg-orb--violet" />
      <span className="home-bg-orb home-bg-orb--teal" />
      <div className="home-bg-grid-drift" />
    </div>
  )
}
