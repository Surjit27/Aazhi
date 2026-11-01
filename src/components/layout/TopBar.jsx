import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, Menu, Trash } from 'lucide-react'
import { useAppStore } from '../../stores/appStore.js'
import useClickOutside from '../../hooks/useClickOutside.js'
import { relativeTime } from '../../utils/format.js'
import { NOW_ISO } from '../../data/executions.js'
import ProjectSwitcher from './ProjectSwitcher.jsx'
import GlobalSearch from './GlobalSearch.jsx'
import ProfileMenu from './ProfileMenu.jsx'
import { isAdminHost } from '../../lib/appHost.js'
import { useAuthStore } from '../../stores/authStore.js'

const NOW = Date.parse(NOW_ISO)
const TONE_DOT = { success: 'bg-success-700', danger: 'bg-danger-700', warning: 'bg-warning-700' }

export default function TopBar({ onToggleNav }) {
  const environments = useAppStore((s) => s.environments)
  const environmentId = useAppStore((s) => s.environmentId)
  const setEnvironment = useAppStore((s) => s.setEnvironment)
  const notifications = useAppStore((s) => s.notifications)
  const unread = notifications.filter((n) => !n.read).length
  const showWorkspaceChrome = !(isAdminHost() && useAuthStore((s) => s.user?.role === 'admin'))

  return (
    <header className="relative z-10 flex h-12 shrink-0 items-center gap-3 border-b border-line bg-white px-3 md:px-4">
      <button
        onClick={onToggleNav}
        aria-label="Toggle navigation"
        className="cursor-pointer rounded p-1.5 text-ink-muted hover:bg-surface md:hidden"
      >
        <Menu size={18} />
      </button>

      {showWorkspaceChrome ? <ProjectSwitcher /> : <span className="text-sm font-medium text-ink">Admin console</span>}

      {showWorkspaceChrome && (
        <>
          <div className="hidden items-center rounded-md border border-line bg-surface p-0.5 lg:flex" role="radiogroup" aria-label="Environment">
            {environments.map((env) => {
              const active = env.id === environmentId
              return (
                <button
                  key={env.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setEnvironment(env.id)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    active ? 'bg-white text-ink shadow-card' : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${env.healthy ? 'bg-success-700' : 'bg-danger-700'}`} />
                  {env.label}
                </button>
              )
            })}
          </div>

          <div className="ml-auto flex min-w-0 flex-1 justify-center md:max-w-md">
            <GlobalSearch />
          </div>

          <NotificationsButton unread={unread} />
        </>
      )}

      {!showWorkspaceChrome && <div className="flex-1" />}

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
        className="relative cursor-pointer rounded-md p-1.5 text-ink-muted transition-colors hover:bg-surface hover:text-ink"
      >
        <Bell size={17} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-700 px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-slide-up absolute top-full right-0 mt-2 w-80 overflow-hidden rounded-lg border border-line bg-white shadow-pop">
          <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
            <span className="text-[13px] font-semibold text-ink">Notifications</span>
            <div className="flex gap-1">
              <button onClick={markAll} className="cursor-pointer rounded px-2 py-1 text-xs text-primary-700 hover:bg-primary-50">
                Mark all read
              </button>
              <button
                onClick={clear}
                aria-label="Clear notifications"
                className="cursor-pointer rounded p-1 text-ink-muted hover:bg-surface hover:text-ink"
              >
                <Trash size={14} />
              </button>
            </div>
          </div>
          <ul className="max-h-80 divide-y divide-line overflow-y-auto scrollbar-thin">
            {notifications.length === 0 && <li className="px-3.5 py-6 text-center text-xs text-ink-muted">You are all caught up.</li>}
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    markRead(n.id)
                    setOpen(false)
                    navigate(n.tone === 'danger' ? '/scheduler' : '/monitor')
                  }}
                  className={`flex w-full cursor-pointer gap-3 px-3.5 py-3 text-left hover:bg-surface ${n.read ? '' : 'bg-primary-50/40'}`}
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
