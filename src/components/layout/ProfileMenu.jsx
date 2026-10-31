import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings, User } from 'lucide-react'
import { useAppStore } from '../../stores/appStore.js'
import useClickOutside from '../../hooks/useClickOutside.js'

export default function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const pushToast = useAppStore((s) => s.pushToast)
  const ref = useClickOutside(() => setOpen(false), open)

  const items = [
    { label: 'Profile', icon: User, action: () => pushToast({ title: 'Profile', body: 'Signed in as maya.chen@acme.dev' }) },
    { label: 'Settings', icon: Settings, action: () => navigate('/settings') },
    { label: 'Sign out', icon: LogOut, action: () => pushToast({ tone: 'warning', title: 'Sign out is disabled in this prototype' }) },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Profile menu"
        aria-expanded={open}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-50"
      >
        MC
      </button>
      {open && (
        <div className="animate-slide-up absolute top-full right-0 z-20 mt-2 w-56 rounded-lg border border-line bg-white p-1 shadow-pop">
          <div className="px-2.5 py-2">
            <p className="text-[13px] font-medium text-ink">Maya Chen</p>
            <p className="text-xs text-ink-muted">maya.chen@acme.dev</p>
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
