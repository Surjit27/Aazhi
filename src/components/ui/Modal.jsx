import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, description, children, footer, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`animate-slide-up flex max-h-[90vh] w-full ${width} flex-col rounded-lg border border-line bg-white shadow-pop`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
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
        {footer && <div className="flex justify-end gap-2 border-t border-line bg-surface px-5 py-3 rounded-b-lg">{footer}</div>}
      </div>
    </div>
  )
}
