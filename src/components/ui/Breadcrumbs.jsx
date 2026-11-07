import { ChevronRight } from 'lucide-react'

export default function Breadcrumbs({ items = [] }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="shrink-0">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-muted">
        {items.map((item, i) => {
          const label = typeof item === 'string' ? item : item.label
          const isLast = i === items.length - 1
          return (
            <li key={`${label}-${i}`} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-ink-subtle" aria-hidden />}
              <span className={isLast ? 'font-medium text-ink' : ''}>{label}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
