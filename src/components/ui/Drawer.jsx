import { useEffect } from 'react'
import { X } from 'lucide-react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

export default function Drawer({ open, onClose, title, description, children, footer, width = 'w-[520px]' }) {
  const reducedMotion = usePrefersReducedMotion()
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={`${reducedMotion ? '' : 'animate-fade-in'} fixed inset-0 z-40 flex justify-end bg-ink/20`}
      onMouseDown={onClose}
    >
      <aside
        role="dialog"
        aria-label={title}
        className={`${reducedMotion ? '' : 'animate-slide-in-right'} flex h-full max-w-full ${width} flex-col border-l border-line bg-white shadow-pop`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded p-1 text-ink-muted hover:bg-surface hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 scrollbar-thin">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line bg-surface px-5 py-3">{footer}</div>}
      </aside>
    </div>
  )
}
