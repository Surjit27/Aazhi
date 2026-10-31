export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      {Icon && (
        <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Icon size={18} />
        </div>
      )}
      <p className="text-[13px] font-medium text-ink">{title}</p>
      {description && <p className="max-w-sm text-xs text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
