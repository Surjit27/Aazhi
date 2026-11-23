import { FolderOpen } from 'lucide-react'

/** Background panel grouping files that share a directory path. */
export default function RepoFolderNode({ data }) {
  const label = data?.label ?? 'folder'
  const count = data?.fileCount ?? 0

  return (
    <div className="pointer-events-none flex h-full w-full flex-col overflow-hidden rounded-xl border border-line/80 bg-canvas/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      <div className="flex shrink-0 items-center gap-2 border-b border-line/70 bg-white/75 px-3 py-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-50 text-primary-700">
          <FolderOpen size={15} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">Folder</p>
          <p className="max-w-[280px] truncate font-mono text-xs font-medium text-ink" title={label}>
            {label}
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium tabular-nums text-ink-muted">
          {count} files
        </span>
      </div>
      <div className="min-h-0 flex-1 bg-[radial-gradient(circle_at_1px_1px,rgba(148,158,175,0.12)_1px,transparent_0)] bg-[length:16px_16px]" />
    </div>
  )
}