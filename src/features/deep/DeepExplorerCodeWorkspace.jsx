import { useMemo, useState } from 'react'
import {
  ChevronRight,
  Code2,
  ExternalLink,
  FolderTree,
  Play,
  Search,
  Settings2,
  Terminal,
} from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import CodeEditor from '../../components/code/CodeEditor.jsx'
import FileTree from '../explorer/FileTree.jsx'
import { SOURCE_FILES as DEMO_SOURCE_FILES, GIT_FILE_STATUS as DEMO_GIT_STATUS, PROJECT_ROOT } from '../../data/backendSource.js'
import { buildFileTree } from '../../utils/fileTree.js'

const ACTIVITY = [
  { id: 'explorer', icon: FolderTree, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'run', icon: Play, label: 'Run' },
]

function languageForPath(path) {
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript'
  if (path.endsWith('.go')) return 'go'
  if (path.endsWith('.json')) return 'json'
  if (path.endsWith('.md')) return 'markdown'
  return 'javascript'
}

export default function DeepExplorerCodeWorkspace({ repos = [] }) {
  const projectRoot = repos[0]?.repo?.split('/').pop() ?? PROJECT_ROOT
  const sourceFiles = DEMO_SOURCE_FILES
  const paths = useMemo(() => Object.keys(sourceFiles), [sourceFiles])
  const tree = useMemo(() => buildFileTree(paths), [paths])
  const defaultFile = paths[0] ?? 'README.md'

  const [activity, setActivity] = useState('explorer')
  const [openTabs, setOpenTabs] = useState([defaultFile])
  const [activeFile, setActiveFile] = useState(defaultFile)
  const [editorTheme, setEditorTheme] = useState('vs-dark')
  const [panel, setPanel] = useState('terminal')
  const [terminalLines, setTerminalLines] = useState([
    '$ deepe workspace attach --editor monaco',
    `Linked: ${repos.length ? repos.map((r) => r.repo).join(', ') : 'demo orders-service (connect repos for sync)'}`,
    'Ready — run tasks from the panel below.',
  ])
  const [running, setRunning] = useState(false)

  const openFile = (path) => {
    setActiveFile(path)
    setOpenTabs((tabs) => (tabs.includes(path) ? tabs : [...tabs, path]))
  }

  const closeTab = (path, e) => {
    e.stopPropagation()
    setOpenTabs((tabs) => {
      const next = tabs.filter((t) => t !== path)
      if (activeFile === path && next.length) setActiveFile(next[next.length - 1])
      if (activeFile === path && !next.length) setActiveFile(defaultFile)
      return next.length ? next : [defaultFile]
    })
  }

  const runDev = () => {
    setPanel('terminal')
    setRunning(true)
    setTerminalLines((lines) => [...lines, '', `$ npm run dev — ${projectRoot}`, ''])
    const steps = [
      '> vite',
      '  Local:   http://127.0.0.1:5173/',
      '  (mock — wire to code-server / remote runner)',
    ]
    let i = 0
    const tick = () => {
      if (i < steps.length) {
        setTerminalLines((lines) => [...lines, steps[i]])
        i += 1
        setTimeout(tick, 400)
      } else {
        setRunning(false)
      }
    }
    setTimeout(tick, 300)
  }

  const vscodeHref = useMemo(() => {
    const slug = repos[0]?.repo
    if (!slug) return 'https://code.visualstudio.com/docs/remote/codespaces'
    return `vscode://vscode.git/clone?url=https://github.com/${encodeURIComponent(slug)}`
  }, [repos])

  return (
    <div className="flex min-h-[560px] flex-col overflow-hidden rounded-lg border border-line bg-[#1e1e1e] text-[#cccccc]">
      <div className="flex items-center justify-between gap-2 border-b border-[#333] bg-[#252526] px-3 py-2">
        <div className="flex items-center gap-2 text-xs">
          <Code2 size={14} className="text-primary-400" />
          <span className="font-medium text-[#e0e0e0]">Codebase</span>
          <span className="hidden text-[#858585] sm:inline">· Monaco editor · VS Code-compatible layout</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral" className="border-[#444] bg-[#333] text-[#ccc]">
            {projectRoot}
          </Badge>
          <select
            aria-label="Editor theme"
            value={editorTheme}
            onChange={(e) => setEditorTheme(e.target.value)}
            className="rounded border border-[#444] bg-[#2d2d2d] px-2 py-1 text-[11px] text-[#ccc]"
          >
            <option value="vs-dark">Dark+</option>
            <option value="vs">Light+</option>
          </select>
          <a href={vscodeHref} target="_blank" rel="noreferrer">
            <Button size="sm" variant="secondary" className="gap-1 border-[#444] bg-[#2d2d2d] text-[#ccc] hover:bg-[#383838]">
              <ExternalLink size={12} /> Open in VS Code
            </Button>
          </a>
          <Button size="sm" variant="primary" className="gap-1" onClick={runDev} disabled={running}>
            <Play size={12} /> Run
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <nav className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-[#333] bg-[#333333] py-2">
          {ACTIVITY.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              title={label}
              onClick={() => setActivity(id)}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition ${
                activity === id ? 'border-l-2 border-primary-400 bg-[#252526] text-white' : 'text-[#858585] hover:text-[#ccc]'
              }`}
            >
              <Icon size={18} />
            </button>
          ))}
          <div className="mt-auto">
            <Settings2 size={16} className="mx-auto text-[#555]" aria-hidden />
          </div>
        </nav>

        {activity === 'explorer' && (
          <aside className="flex w-56 shrink-0 flex-col border-r border-[#333] bg-[#252526]">
            <p className="px-3 py-2 text-[10px] font-semibold tracking-wide text-[#858585] uppercase">Explorer</p>
            <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin [&_button]:text-[#ccc] [&_button:hover]:bg-[#2a2d2e]">
              <FileTree tree={tree} paths={paths} selectedPath={activeFile} onSelect={openFile} gitStatus={DEMO_GIT_STATUS} />
            </div>
          </aside>
        )}

        {activity === 'search' && (
          <aside className="flex w-56 shrink-0 flex-col border-r border-[#333] bg-[#252526] p-3">
            <p className="text-[10px] font-semibold tracking-wide text-[#858585] uppercase">Search</p>
            <input
              placeholder="Search in files (soon)"
              className="mt-2 w-full rounded border border-[#444] bg-[#3c3c3c] px-2 py-1.5 text-xs text-[#ccc] placeholder:text-[#858585]"
              disabled
            />
            <p className="mt-3 text-xs text-[#858585]">Index syncs when the reverse-engineer agent completes.</p>
          </aside>
        )}

        {activity === 'run' && (
          <aside className="flex w-56 shrink-0 flex-col border-r border-[#333] bg-[#252526] p-3">
            <p className="text-[10px] font-semibold tracking-wide text-[#858585] uppercase">Run & debug</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>
                <button type="button" className="w-full cursor-pointer rounded px-2 py-1 text-left hover:bg-[#2a2d2e]" onClick={runDev}>
                  npm run dev
                </button>
              </li>
              <li>
                <button type="button" className="w-full rounded px-2 py-1 text-left text-[#555]" disabled>
                  npm test (soon)
                </button>
              </li>
            </ul>
          </aside>
        )}

        <section className="flex min-w-0 flex-1 flex-col bg-[#1e1e1e]">
          <div className="flex overflow-x-auto border-b border-[#333] bg-[#2d2d2d]">
            {openTabs.map((path) => {
              const active = path === activeFile
              return (
                <button
                  key={path}
                  type="button"
                  onClick={() => setActiveFile(path)}
                  className={`group flex max-w-[200px] shrink-0 cursor-pointer items-center gap-1 border-r border-[#333] px-3 py-2 text-xs ${
                    active ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#323232]'
                  }`}
                >
                  <span className="truncate">{path.split('/').pop()}</span>
                  {openTabs.length > 1 && (
                    <span
                      role="button"
                      tabIndex={0}
                      className="rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-[#444]"
                      onClick={(e) => closeTab(path, e)}
                      onKeyDown={(e) => e.key === 'Enter' && closeTab(path, e)}
                      aria-label={`Close ${path}`}
                    >
                      ×
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1 border-b border-[#333] bg-[#252526] px-3 py-1 text-[11px] text-[#858585]">
            <span className="font-mono text-[#ccc]">{projectRoot}</span>
            <ChevronRight size={10} />
            <span className="truncate font-mono">{activeFile}</span>
          </div>

          <div className="min-h-[280px] flex-1">
            <CodeEditor
              key={`${activeFile}-${editorTheme}`}
              value={sourceFiles[activeFile] ?? ''}
              language={languageForPath(activeFile)}
              theme={editorTheme}
              readOnly={false}
              onChange={() => {}}
            />
          </div>

          <div className="flex h-36 shrink-0 flex-col border-t border-[#333] bg-[#252526]">
            <div className="flex gap-2 border-b border-[#333] px-2">
              <button
                type="button"
                onClick={() => setPanel('terminal')}
                className={`flex cursor-pointer items-center gap-1 border-b-2 px-2 py-1.5 text-[11px] ${
                  panel === 'terminal' ? 'border-primary-400 text-white' : 'border-transparent text-[#858585]'
                }`}
              >
                <Terminal size={12} /> Terminal
              </button>
              <button
                type="button"
                onClick={() => setPanel('problems')}
                className={`cursor-pointer border-b-2 px-2 py-1.5 text-[11px] ${
                  panel === 'problems' ? 'border-primary-400 text-white' : 'border-transparent text-[#858585]'
                }`}
              >
                Problems
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2 font-mono text-[11px] leading-relaxed text-[#d4d4d4]">
              {panel === 'terminal' ? (
                terminalLines.map((line, i) => <div key={`${i}-${line.slice(0, 12)}`}>{line}</div>)
              ) : (
                <p className="text-[#858585]">No problems — ESLint integration coming with live workspace sync.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <p className="border-t border-[#333] bg-[#252526] px-3 py-2 text-[10px] text-[#858585]">
        Production path: mount linked repos via code-server, dev container, or Deepe remote runner — same UI shell.
      </p>
    </div>
  )
}
