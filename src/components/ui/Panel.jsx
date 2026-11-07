import Breadcrumbs from './Breadcrumbs.jsx'

export function PageHeader({ title, description, actions, breadcrumbs }) {
  return (
    <div className="flex flex-col gap-4 px-6 pt-6 pb-1 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-ink md:text-[22px]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p>}
      </div>
      <div className="flex flex-col items-start gap-3 sm:items-end">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

export function Panel({ title, description, actions, toolbar, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`glass-card flex min-w-0 flex-col overflow-hidden ${className}`}>
      {(title || actions || toolbar) && (
        <header className="flex flex-col gap-2 border-b border-line/80 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-ink-muted">{description}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {toolbar}
            {actions}
          </div>
        </header>
      )}
      <div className={`min-h-0 flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  )
}
