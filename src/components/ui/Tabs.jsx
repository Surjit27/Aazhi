export default function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div role="tablist" className={`flex gap-1 border-b border-line ${className}`}>
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`-mb-px flex cursor-pointer items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition-colors ${
              active ? 'border-primary-600 text-primary-700' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count != null && (
              <span className={`rounded px-1.5 text-[11px] ${active ? 'bg-primary-50 text-primary-700' : 'bg-surface text-ink-muted'}`}>
                {tab.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
