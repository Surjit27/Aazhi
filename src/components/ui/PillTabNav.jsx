export default function PillTabNav({ tabs, value, onChange, ariaLabel, className = '' }) {
  return (
    <div
      className={`inline-flex max-w-full gap-1 overflow-x-auto rounded-lg border border-line bg-surface p-0.5 ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map(({ id, label }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={`shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              active ? 'bg-white text-ink shadow-card' : 'text-ink-muted hover:text-ink'
            }`}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}