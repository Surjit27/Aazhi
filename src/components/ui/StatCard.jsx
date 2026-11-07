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
    <svg viewBox="0 0 64 32" className="h-9 w-full" aria-hidden>
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
    <div className="glass-card relative p-5 transition-shadow hover:shadow-pop">
      {Icon && (
        <div className={`absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full ${iconClass}`}>
          <Icon size={18} strokeWidth={1.75} />
        </div>
      )}
      <p className="pr-12 text-sm font-medium text-ink-muted">{label}</p>
      <p className="mt-1 text-[26px] font-semibold leading-8 text-ink tabular-nums">{value}</p>
      {typeof trend === 'number' && (
        <p className={`mt-0.5 text-xs font-medium tabular-nums ${trendClass}`}>
          {trendUp ? '+' : ''}
          {trend}%
          {trendLabel && <span className="ml-1 font-normal text-ink-subtle">{trendLabel}</span>}
        </p>
      )}
      {hint && typeof trend !== 'number' && <p className="mt-0.5 text-xs text-ink-subtle">{hint}</p>}
      <div className="mt-4 border-t border-line/70 pt-3">
        <Sparkline tone={tone} />
      </div>
    </div>
  )
}
