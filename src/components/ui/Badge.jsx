import { methodTone } from '../../utils/format.js'

const TONES = {
  neutral: 'bg-surface text-ink-muted border-line',
  primary: 'bg-primary-50 text-primary-700 border-primary-100',
  success: 'bg-success-50 text-success-700 border-transparent',
  warning: 'bg-warning-50 text-warning-700 border-transparent',
  danger: 'bg-danger-50 text-danger-700 border-transparent',
}

export default function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-px text-[11px] font-medium leading-4 whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export function MethodBadge({ method }) {
  return <Badge tone={methodTone(method)} className="font-mono w-[52px] justify-center">{method}</Badge>
}
