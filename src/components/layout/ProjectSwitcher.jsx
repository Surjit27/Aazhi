import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Check, FolderGit2, Layers } from 'lucide-react'
import { useAppStore } from '../../stores/appStore.js'
import useClickOutside from '../../hooks/useClickOutside.js'
import { backendBasePath } from '../../data/backends.js'

export default function ProjectSwitcher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const backends = useAppStore((s) => s.backends)
  const backendId = useAppStore((s) => s.backendId)
  const setBackend = useAppStore((s) => s.setBackend)
  const pushToast = useAppStore((s) => s.pushToast)
  const ref = useClickOutside(() => setOpen(false), open)
  const current = backends.find((b) => b.id === backendId) ?? backends[0]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex max-w-[220px] cursor-pointer items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1.5 text-[13px] font-medium text-ink shadow-card transition-colors hover:bg-surface"
      >
        <FolderGit2 size={14} className="shrink-0 text-primary-600" />
        <span className="truncate">{current?.name ?? 'Select backend'}</span>
        <ChevronDown size={14} className="shrink-0 text-ink-subtle" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="animate-slide-up absolute top-full left-0 z-20 mt-1.5 w-72 rounded-lg border border-line bg-white p-1 shadow-pop"
        >
          <li className="px-2.5 py-1.5">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                navigate('/backends')
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-primary-700 hover:bg-primary-50"
            >
              <Layers size={14} /> All backends
            </button>
          </li>
          {backends.map((p) => (
            <li key={p.id}>
              <button
                role="option"
                aria-selected={p.id === backendId}
                onClick={() => {
                  setBackend(p.id)
                  setOpen(false)
                  navigate(backendBasePath(p.id))
                  pushToast({ title: 'Backend switched', body: p.name })
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-surface"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-ink">{p.name}</span>
                  <span className="block text-xs text-ink-muted">{p.description}</span>
                </span>
                {p.id === backendId && <Check size={14} className="text-primary-700" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
