import { CircleCheck, CircleX, Info, X } from 'lucide-react'
import { useAppStore } from '../../stores/appStore.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

const ICONS = {
  success: <CircleCheck size={16} className="text-success-700" />,
  danger: <CircleX size={16} className="text-danger-700" />,
  warning: <Info size={16} className="text-warning-700" />,
}

export default function Toaster() {
  const toasts = useAppStore((s) => s.toasts)
  const dismiss = useAppStore((s) => s.dismissToast)
  const reducedMotion = usePrefersReducedMotion()

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-80 flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${reducedMotion ? '' : 'animate-slide-up'} pointer-events-auto flex items-start gap-3 rounded-lg border border-line bg-white px-3.5 py-3 shadow-pop`}
        >
          <span className="mt-0.5">{ICONS[t.tone] ?? ICONS.success}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-ink">{t.title}</p>
            {t.body && <p className="text-xs text-ink-muted">{t.body}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="cursor-pointer text-ink-subtle hover:text-ink">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
