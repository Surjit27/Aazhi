import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings, User } from 'lucide-react'
import { useAppStore } from '../../stores/appStore.js'
import { useAuthStore } from '../../stores/authStore.js'
import useClickOutside from '../../hooks/useClickOutside.js'
import Badge from '../ui/Badge.jsx'

function initials(name, email) {
  const base = name?.trim() || email || '?'
  const parts = base.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return base.slice(0, 2).toUpperCase()
}

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const pushToast = useAppStore((s) => s.pushToast)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const ref = useClickOutside(() => setOpen(false), open)

  if (!user) return null

  const items = [
    { label: 'Profile', icon: User, action: () => pushToast({ title: 'Profile', body: user.email }) },
    { label: 'Settings', icon: Settings, action: () => navigate('/settings') },
    {
      label: 'Sign out',
      icon: LogOut,
      action: async () => {
        await logout()
        navigate('/login', { replace: true })
      },
    },
  ]

  const impersonating = Boolean(user.impersonation)

  return (
    <div className="relative flex items-center gap-2" ref={ref}>
      <div className="hidden min-w-0 text-right md:block">
        <p className="truncate text-[13px] font-medium text-ink">{user.displayName}</p>
        {impersonating ? (
          <Badge tone="warning" className="mt-0.5 text-[10px]">
            Impersonation
          </Badge>
        ) : (
          <p className="truncate text-[11px] capitalize text-ink-muted">{user.role}</p>
        )}
      </div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Profile menu"
        aria-expanded={open}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 ring-2 ring-white transition-colors hover:bg-primary-50"
      >
        {initials(user.displayName, user.email)}
      </button>
      {open && (
        <div className="animate-slide-up absolute top-full right-0 z-20 mt-2 w-56 rounded-lg border border-line bg-white p-1 shadow-pop">
          <div className="px-2.5 py-2">
            <p className="text-[13px] font-medium text-ink">{user.displayName}</p>
            <p className="text-xs text-ink-muted">{user.email}</p>
            {impersonating ? (
              <p className="mt-1.5 rounded-lg border border-warning-700/15 bg-warning-50/80 px-2 py-1.5 text-[10px] leading-snug text-ink-muted">
                <span className="font-semibold text-warning-700">Impersonation</span>
                <span> · Viewing as </span>
                <span className="font-medium text-ink">{user.email}</span>
                <span>. Session expires in 2 hours — sign out when finished.</span>
              </p>
            ) : (
              <Badge tone={user.role === 'admin' ? 'primary' : 'neutral'}>{user.role}</Badge>
            )}
          </div>
          <div className="my-1 border-t border-line" />
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setOpen(false)
                item.action()
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-ink-muted hover:bg-surface hover:text-ink"
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
