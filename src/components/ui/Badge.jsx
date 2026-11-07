import { methodTone } from '../../utils/format.js'

const TONES = {
  neutral: 'bg-surface text-ink-muted border-line',
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
  success: 'bg-success-50 text-success-700 border-success-700/12',
  warning: 'bg-warning-50 text-warning-700 border-warning-700/12',
  danger: 'bg-danger-50 text-danger-700 border-danger-700/12',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
  teal: 'bg-teal-50 text-teal-700 border-teal-100',
  cyan: 'bg-cyan-50 text-cyan-800 border-cyan-100',
  amber: 'bg-amber-50 text-amber-800 border-amber-100',
}

export default function Badge({ tone = 'neutral', className = '', children, dot = false }) {
  const dotColor =
    tone === 'success'
      ? 'bg-success-700'
      : tone === 'danger'
        ? 'bg-danger-700'
        : tone === 'warning'
          ? 'bg-warning-700'
          : tone === 'primary'
            ? 'bg-primary-500'
            : 'bg-ink-subtle'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor}`} aria-hidden />}
      {children}
    </span>
  )
}

export function MethodBadge({ method }) {
  return (
    <Badge tone={methodTone(method)} className="rounded-md font-mono w-[52px] justify-center">
      {method}
    </Badge>
  )
}
