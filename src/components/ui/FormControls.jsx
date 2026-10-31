const CONTROL =
  'w-full rounded-md border border-line bg-white px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-subtle transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-50 disabled:bg-surface disabled:text-ink-subtle'

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-xs font-medium text-ink">{label}</span>}
      {children}
      {error ? (
        <span className="text-xs text-danger-700">{error}</span>
      ) : (
        hint && <span className="text-xs text-ink-subtle">{hint}</span>
      )}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`${CONTROL} ${className}`} {...props} />
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${CONTROL} cursor-pointer ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${CONTROL} resize-y font-mono text-xs leading-5 ${className}`} {...props} />
}
