const ICON = '/brand/deepe-icon.png'

export const BRAND_NAME = 'deepe'

export function BrandIcon({ size = 32, className = '', alt = '' }) {
  return (
    <img
      src={ICON}
      width={size}
      height={size}
      alt={alt}
      className={`object-contain ${className}`}
      draggable={false}
    />
  )
}

/** Icon + lowercase wordmark (matches deepe brand) */
export function BrandLockup({ className = '', iconSize = 44 }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <BrandIcon size={iconSize} alt="" />
      <span className="text-[22px] font-semibold tracking-tight text-ink lowercase">{BRAND_NAME}</span>
    </div>
  )
}
