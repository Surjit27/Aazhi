const ICON_TONE = {
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success-50 text-success-700',
  warning: 'bg-warning-50 text-warning-700',
  danger: 'bg-danger-50 text-danger-700',
  neutral: 'bg-surface text-ink-muted',
}

const SPARK_POINTS = {
  primary: '4,28 12,22 20,24 28,14 36,16 44,8 52,10 60,4',
  success: '4,26 14,20 22,22 30,16 38,18 46,12 54,14 60,6',
  warning: '4,24 12,20 22,22 28,18 36,20 44,16 52,18 60,12',
  danger: '4,8 12,14 20,12 28,18 36,16 44,22 52,20 60,26',
  neutral: '4,20 14,18 24,20 34,16 44,18 54,14 60,16',
}

function Sparkline({ tone = 'primary' }) {
  const points = SPARK_POINTS[tone] ?? SPARK_POINTS.primary
  return (
    <svg viewBox="0 0 64 32" className="h-8 w-full" aria-hidden>
      <defs>
        <linearGradient id={`spark-fill-${tone}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F86F7" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#4F86F7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="#4F86F7"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

export default function StatCard({ label, value, hint, icon: Icon, tone = 'primary', trend, trendLabel }) {
  const iconClass = ICON_TONE[tone] ?? ICON_TONE.primary
  const trendUp = typeof trend === 'number' && trend >= 0
  const trendClass = trendUp ? 'text-success-700' : 'text-danger-700'

  return (
    <div className="glass-card p-4 transition-shadow hover:shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
              <Icon size={18} strokeWidth={1.75} />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink-muted">{label}</p>
            <p className="mt-0.5 text-2xl font-semibold text-ink tabular-nums leading-8">{value}</p>
            {typeof trend === 'number' && (
              <p className={`mt-0.5 text-xs font-medium tabular-nums ${trendClass}`}>
                {trendUp ? '+' : ''}
                {trend}%
                {trendLabel && <span className="ml-1 font-normal text-ink-subtle">{trendLabel}</span>}
              </p>
            )}
            {hint && typeof trend !== 'number' && (
              <p className="mt-0.5 truncate text-[11px] text-ink-subtle">{hint}</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 border-t border-line/60 pt-2">
        <Sparkline tone={tone} />
      </div>
    </div>
  )
}
