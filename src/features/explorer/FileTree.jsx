import { memo, useCallback, useState } from 'react'
import { ChevronDown, ChevronRight, FileCode, Folder } from 'lucide-react'
import { folderPaths } from '../../utils/fileTree.js'

const GIT_TONE = {
  M: 'text-warning-700',
  A: 'text-success-700',
  U: 'text-primary-700',
}

const TreeNode = memo(function TreeNode({ node, depth, selectedPath, onSelect, gitStatus, expanded, toggle }) {
  const pad = { paddingLeft: 8 + depth * 12 }

  if (node.type === 'folder') {
    const open = expanded.has(node.path)
    return (
      <>
        <button
          style={pad}
          onClick={() => toggle(node.path)}
          className="flex w-full cursor-pointer items-center gap-1 py-1 pr-2 text-left text-[13px] text-ink-muted hover:bg-surface hover:text-ink"
        >
          {open ? <ChevronDown size={13} className="shrink-0" /> : <ChevronRight size={13} className="shrink-0" />}
          <Folder size={13} className="shrink-0 text-primary-600" />
          <span className="truncate">{node.name}</span>
        </button>
        {open &&
          node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              gitStatus={gitStatus}
              expanded={expanded}
              toggle={toggle}
            />
          ))}
      </>
    )
  }

  const status = gitStatus[node.path]
  const active = node.path === selectedPath
  return (
    <button
      style={{ paddingLeft: 8 + depth * 12 + 16 }}
      onClick={() => onSelect(node.path)}
      className={`flex w-full cursor-pointer items-center gap-1.5 py-1 pr-2 text-left text-[13px] transition-colors ${
        active ? 'bg-primary-50 font-medium text-primary-700' : 'text-ink hover:bg-surface'
      }`}
    >
      <FileCode size={13} className="shrink-0 text-ink-subtle" />
      <span className="min-w-0 flex-1 truncate">{node.name}</span>
      {status && <span className={`font-mono text-[11px] font-semibold ${GIT_TONE[status]}`}>{status}</span>}
    </button>
  )
})

export default function FileTree({ tree, paths, selectedPath, onSelect, gitStatus }) {
  const [expanded, setExpanded] = useState(() => folderPaths(paths))
  const toggle = useCallback((path) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto py-1 scrollbar-thin" role="tree" aria-label="Project files">
        {tree.map((node) => (
          <TreeNode
            key={node.path}
            node={node}
            depth={0}
            selectedPath={selectedPath}
            onSelect={onSelect}
            gitStatus={gitStatus}
            expanded={expanded}
            toggle={toggle}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-line px-3 py-2 text-[11px] text-ink-muted">
        <span><span className="font-mono font-semibold text-warning-700">M</span> modified</span>
        <span><span className="font-mono font-semibold text-success-700">A</span> added</span>
        <span><span className="font-mono font-semibold text-primary-700">U</span> untracked</span>
      </div>
    </div>
  )
}
