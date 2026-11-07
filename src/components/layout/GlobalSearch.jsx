import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Braces, Search } from 'lucide-react'
import { getPortal, PORTAL } from '../../lib/portal.js'
import { ADMIN_NAV, CLIENT_NAV } from '../../routes/index.jsx'
import { useFeatureFlagsStore } from '../../stores/featureFlagsStore.js'
import useClickOutside from '../../hooks/useClickOutside.js'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useClickOutside(() => setOpen(false), open)
  const portal = getPortal()
  const isAdminPortal = portal === PORTAL.ADMIN
  const flags = useFeatureFlagsStore((s) => s.flags)
  const isNavEnabled = useFeatureFlagsStore((s) => s.isNavEnabled)

  const index = useMemo(
    () =>
      (isAdminPortal ? ADMIN_NAV : CLIENT_NAV.filter((item) => isNavEnabled(item.to, item.flagKey))).map((item) => ({
        key: item.to,
        label: item.label,
        detail: isAdminPortal ? 'Admin console' : 'Client workspace',
        keywords: item.keywords ?? '',
        to: item.to,
        icon: item.icon,
      })),
    [isAdminPortal, flags, isNavEnabled],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = index
    if (!q) return isAdminPortal ? [] : pool
    return pool
      .filter((item) => `${item.label} ${item.detail} ${item.keywords} ${item.to}`.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, index, isAdminPortal])

  const go = (to) => {
    navigate(to)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative w-full" ref={ref}>
      <Search size={14} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-subtle" />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) go(results[0].to)
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder={isAdminPortal ? 'Search admin pages' : 'Search client workspace'}
        aria-label="Global search"
        className="glass-inset h-9 w-full pr-3 pl-8 text-[13px] text-ink placeholder:text-ink-subtle focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-50"
      />
      {open && (query.trim() || !isAdminPortal) && (
        <ul className="animate-slide-up absolute top-full right-0 left-0 mt-1.5 max-h-80 overflow-y-auto rounded-lg border border-line bg-white p-1 shadow-pop scrollbar-thin">
          {results.length === 0 && <li className="px-3 py-4 text-center text-xs text-ink-muted">No matches for "{query}"</li>}
          {results.map((item) => {
            const Icon = item.icon ?? Braces
            return (
              <li key={item.key}>
                <button onClick={() => go(item.to)} className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-surface">
                  <Icon size={14} className="shrink-0 text-ink-subtle" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-ink">{item.label}</span>
                    <span className="block truncate text-[11px] text-ink-muted">{item.detail}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
