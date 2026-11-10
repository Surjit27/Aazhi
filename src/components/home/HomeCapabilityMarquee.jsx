const ITEMS = [
  'Git-backed backend index',
  'Route & repo explorer',
  'Visual workflow canvas',
  'Cron & webhook triggers',
  'Execution monitor',
  'Event injection validation',
  'Isolated client workspaces',
  'Admin tenant overview',
]

function Track({ duplicate }) {
  return (
    <div className="home-marquee-track flex shrink-0 items-center gap-3 pr-3" aria-hidden={duplicate}>
      {ITEMS.map((label) => (
        <span
          key={`${duplicate ? 'dup-' : ''}${label}`}
          className="home-marquee-pill shrink-0 rounded-full border border-line/90 bg-white/70 px-4 py-1.5 text-[12px] font-medium text-ink-muted backdrop-blur-sm"
        >
          {label}
        </span>
      ))}
    </div>
  )
}

export default function HomeCapabilityMarquee({ className = '' }) {
  return (
    <div
      className={`home-marquee glass-inset overflow-hidden border-y border-line/80 py-3 ${className}`}
      aria-label="Platform capabilities"
    >
      <div className="home-marquee-inner flex w-max">
        <Track />
        <Track duplicate />
      </div>
    </div>
  )
}
