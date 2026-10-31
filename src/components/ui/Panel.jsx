export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-ink">{title}</h1>
        {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ title, description, actions, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`flex min-w-0 flex-col rounded-lg border border-line bg-white shadow-card ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="text-[13px] font-semibold text-ink">{title}</h2>}
            {description && <p className="text-xs text-ink-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  )
}
