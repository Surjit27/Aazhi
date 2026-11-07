import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Menu, Trash } from 'lucide-react'
import { useAppStore } from '../../stores/appStore.js'
import useClickOutside from '../../hooks/useClickOutside.js'
import { relativeTime } from '../../utils/format.js'
import { NOW_ISO } from '../../data/executions.js'
import GlobalSearch from './GlobalSearch.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import { getPortal, PORTAL } from '../../lib/portal.js'
import { useAuthStore } from '../../stores/authStore.js'

const NOW = Date.parse(NOW_ISO)
const TONE_DOT = { success: 'bg-success-700', danger: 'bg-danger-700', warning: 'bg-warning-700' }

export default function TopBar({ onToggleNav }) {
  const notifications = useAppStore((s) => s.notifications)
  const unread = notifications.filter((n) => !n.read).length
  const portal = getPortal()
  const user = useAuthStore((s) => s.user)
  const role = user?.role
  const impersonating = Boolean(user?.impersonation)
  const isAdminConsole = portal === PORTAL.ADMIN && role === 'admin'
  const isClientWorkspace = portal === PORTAL.CLIENT && role === 'client'
  const showSearch = isAdminConsole || isClientWorkspace
  const impersonationDetail = user
    ? `Impersonation · Viewing as ${user.email}. Session expires in 2 hours — sign out when finished.`
    : ''

  return (
    <header className="glass-bar relative z-10 flex h-14 shrink-0 items-center gap-2 px-3 md:gap-3 md:px-5">
      <button
        onClick={onToggleNav}
        aria-label="Toggle navigation"
        className="cursor-pointer rounded-lg p-2 text-ink-muted hover:bg-white/80 md:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {showSearch ? (
          <div className="w-full max-w-xl">
            <GlobalSearch />
          </div>
        ) : (
          <div className="flex-1" />
        )}
      </div>

      {isClientWorkspace && <NotificationsButton unread={unread} />}

      {impersonating && (
        <p
          className="glass-inset hidden max-w-[10.5rem] shrink truncate px-2 py-1 text-[10px] leading-snug text-ink-muted sm:block md:max-w-[12rem]"
          title={impersonationDetail}
        >
          <span className="font-semibold text-warning-700">Impersonation</span>
          <span className="text-ink-subtle"> · </span>
          <span className="font-medium text-ink">{user.email}</span>
        </p>
      )}

      <ProfileMenu />
    </header>
  )
}

function NotificationsButton({ unread }) {
  const [open, setOpen] = useState(false)
  const notifications = useAppStore((s) => s.notifications)
  const markRead = useAppStore((s) => s.markNotificationRead)
  const markAll = useAppStore((s) => s.markAllNotificationsRead)
  const clear = useAppStore((s) => s.clearNotifications)
  const navigate = useNavigate()
  const ref = useClickOutside(() => setOpen(false), open)

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative cursor-pointer rounded-lg p-2 text-ink-muted transition-colors hover:bg-white/80 hover:text-ink"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-700 px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="glass-card animate-slide-up absolute top-full right-0 mt-2 w-80 overflow-hidden shadow-pop">
          <div className="flex items-center justify-between border-b border-line/80 px-3.5 py-2.5">
            <span className="text-[13px] font-semibold text-ink">Notifications</span>
            <div className="flex gap-1">
              <button onClick={markAll} className="cursor-pointer rounded-lg px-2 py-1 text-xs text-primary-600 hover:bg-primary-50">
                Mark all read
              </button>
              <button
                onClick={clear}
                aria-label="Clear notifications"
                className="cursor-pointer rounded-lg p-1 text-ink-muted hover:bg-surface hover:text-ink"
              >
                <Trash size={14} />
              </button>
            </div>
          </div>
          <ul className="max-h-80 divide-y divide-line overflow-y-auto bg-white/90 scrollbar-thin">
            {notifications.length === 0 && <li className="px-3.5 py-6 text-center text-xs text-ink-muted">You are all caught up.</li>}
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    markRead(n.id)
                    setOpen(false)
                    navigate(n.tone === 'danger' ? '/scheduler' : '/monitor')
                  }}
                  className={`flex w-full cursor-pointer gap-3 px-3.5 py-3 text-left hover:bg-surface ${n.read ? '' : 'bg-primary-50/50'}`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TONE_DOT[n.tone]}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink">{n.title}</span>
                    <span className="block text-xs text-ink-muted">{n.body}</span>
                    <span className="mt-0.5 block text-[11px] text-ink-subtle">{relativeTime(n.time, NOW)}</span>
                  </span>
                  {n.read && <Check size={14} className="mt-1 shrink-0 text-ink-subtle" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
