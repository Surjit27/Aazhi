import { BrandIcon, BRAND_NAME } from '../ui/Brand.jsx'

export function PanelFilterBar({ children }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>
}

export function FilterChip({ children, active = false }) {
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-primary-200 bg-primary-50 text-primary-700'
          : 'border-line bg-white/80 text-ink-muted hover:bg-surface'
      }`}
    >
      {children}
    </button>
  )
}

export function WorkspaceInsightCard({ title, subtitle, metric, metricLabel }) {
  return (
    <div className="relative overflow-hidden rounded-[12px] bg-linear-to-br from-primary-600 via-primary-500 to-violet-600 p-5 text-white shadow-card">
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-white/80">{title}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{metric}</p>
          <p className="mt-1 text-xs text-white/75">{metricLabel}</p>
          {subtitle && <p className="mt-3 text-[11px] leading-relaxed text-white/70">{subtitle}</p>}
        </div>
        <BrandIcon size={44} className="opacity-95" alt="" />
      </div>
      <div className="relative mt-4 flex items-center justify-between rounded-lg bg-white/15 px-3 py-2 text-[11px] backdrop-blur-sm">
        <span className="font-medium">{BRAND_NAME}</span>
        <span className="text-white/80">Admin workspace</span>
      </div>
    </div>
  )
}

export function MiniMetricCard({ label, value, delta, tone = 'success', icon: Icon }) {
  const wrap =
    tone === 'danger'
      ? 'bg-danger-50 text-danger-700'
      : tone === 'warning'
        ? 'bg-warning-50 text-warning-700'
        : 'bg-success-50 text-success-700'
  const deltaClass = delta >= 0 ? 'text-success-700' : 'text-danger-700'

  return (
    <div className="glass-card flex items-center gap-3 p-3.5">
      {Icon && (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${wrap}`}>
          <Icon size={16} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="text-sm font-semibold text-ink tabular-nums">{value}</p>
      </div>
      {typeof delta === 'number' && (
        <span className={`text-xs font-medium tabular-nums ${deltaClass}`}>
          {delta >= 0 ? '+' : ''}
          {delta}%
        </span>
      )}
    </div>
  )
}

export function DistributionBar({ label, value, percent, color = 'bg-primary-500' }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-ink-muted tabular-nums">
          {value} · {percent}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
    </div>
  )
}

export function RecentUsersList({ users, emptyMessage }) {
  if (users.length === 0) {
    return <p className="px-5 py-8 text-center text-xs text-ink-muted">{emptyMessage}</p>
  }

  return (
    <ul className="divide-y divide-line/80">
      {users.map((u) => (
        <li key={u.id} className="flex items-center gap-3 px-5 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
            {(u.displayName || u.email || '?').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{u.displayName || u.email}</p>
            <p className="truncate text-xs text-ink-muted">{u.email}</p>
          </div>
          <span className="shrink-0 text-xs font-medium capitalize text-ink-subtle">{u.role}</span>
        </li>
      ))}
    </ul>
  )
}
