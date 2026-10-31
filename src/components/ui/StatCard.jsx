export default function StatCard({ label, value, hint, icon: Icon, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary-50 text-primary-700',
    success: 'bg-success-50 text-success-700',
    danger: 'bg-danger-50 text-danger-700',
    warning: 'bg-warning-50 text-warning-700',
  }
  return (
    <div className="flex items-start gap-3 rounded-lg border border-line bg-white p-4 shadow-card">
      {Icon && (
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon size={17} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="text-xl leading-7 font-semibold text-ink tabular-nums">{value}</p>
        {hint && <p className="truncate text-[11px] text-ink-subtle">{hint}</p>}
      </div>
    </div>
  )
}
