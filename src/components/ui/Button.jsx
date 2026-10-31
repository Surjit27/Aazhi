const VARIANTS = {
  primary: 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 shadow-sm',
  secondary: 'bg-white text-ink border-line hover:bg-surface shadow-sm',
  ghost: 'bg-transparent text-ink-muted border-transparent hover:bg-surface hover:text-ink',
  danger: 'bg-white text-danger-700 border-line hover:bg-danger-50',
  dangerSolid: 'bg-danger-700 text-white border-danger-700 hover:bg-red-800 shadow-sm',
}

const SIZES = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-8 px-3 text-[13px] gap-2',
}

export default function Button({ variant = 'secondary', size = 'md', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center rounded-md border font-medium whitespace-nowrap transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
}
