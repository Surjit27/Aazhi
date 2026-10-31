import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import { ChevronRight, Network } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { PageHeader } from '../components/ui/Panel.jsx'
import CodeEditor from '../components/code/CodeEditor.jsx'
import FileTree from '../features/explorer/FileTree.jsx'
import {
  DependenciesPanel,
  FunctionsTable,
  ParametersPanel,
  RoutesTable,
} from '../features/explorer/ExplorerInsights.jsx'
import { useBackendExplorerCatalog } from '../context/BackendExplorerContext.jsx'
import { backendBasePath } from '../data/backends.js'
import { buildFileTree, functionEndLine } from '../utils/fileTree.js'

const TAB_IDS = ['functions', 'routes', 'dependencies', 'parameters']

export default function BackendExplorerPage() {
  const { backendId } = useParams()
  const { backend } = useOutletContext()
  const catalog = useBackendExplorerCatalog()
  const {
    projectRoot,
    sourceFiles,
    backendFunctions,
    backendRoutes,
    gitFileStatus,
    lineOf,
  } = catalog

  const paths = useMemo(() => Object.keys(sourceFiles), [sourceFiles])
  const tree = useMemo(() => buildFileTree(paths), [paths])
  const defaultFile = paths[0] ?? 'README.md'

  const tabs = useMemo(
    () => [
      { id: 'functions', label: 'Functions', count: backendFunctions.length },
      { id: 'routes', label: 'API routes', count: backendRoutes.length },
      { id: 'dependencies', label: 'Dependencies' },
      { id: 'parameters', label: 'Parameters' },
    ],
    [backendFunctions.length, backendRoutes.length],
  )

  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const fnName = params.get('fn')
  const tabParam = params.get('tab')
  const tab = TAB_IDS.includes(tabParam) ? tabParam : 'functions'
  const selectedFn = backendFunctions.find((f) => f.name === fnName) ?? null
  const fileFromParams = selectedFn?.file ?? null

  const [fileState, setFileState] = useState(defaultFile)
  const activeFile = fileFromParams ?? fileState

  const editorRef = useRef(null)
  const decorationIds = useRef([])
  const latest = useRef({ fn: selectedFn, file: activeFile })
  latest.current = { fn: selectedFn, file: activeFile }

  useEffect(() => {
    if (!paths.includes(activeFile) && paths[0]) setFileState(paths[0])
  }, [paths, activeFile])

  const updateParams = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([key, value]) => (value == null ? next.delete(key) : next.set(key, value)))
    setParams(next)
  }

  const selectFunction = (name) => updateParams({ fn: name })
  const selectFile = (path) => {
    setFileState(path)
    updateParams({ fn: null })
  }

  const applyHighlight = (editor, fn, file) => {
    if (!editor) return
    if (!fn || fn.file !== file) {
      decorationIds.current = editor.deltaDecorations(decorationIds.current, [])
      return
    }
    const line = lineOf(fn.file, fn.signature)
    const end = functionEndLine(sourceFiles[file], line)
    decorationIds.current = editor.deltaDecorations(decorationIds.current, [
      {
        range: { startLineNumber: line, startColumn: 1, endLineNumber: end, endColumn: 1 },
        options: { isWholeLine: true, className: 'fn-highlight' },
      },
    ])
    editor.revealLineInCenter(line)
  }

  const handleEditorMount = (editor) => {
    editorRef.current = editor
    decorationIds.current = []
    applyHighlight(editor, latest.current.fn, latest.current.file)
  }

  useEffect(() => {
    applyHighlight(editorRef.current, selectedFn, activeFile)
  }, [selectedFn, activeFile])

  const changedCount = Object.keys(gitFileStatus).length
  const selectedLine = selectedFn ? lineOf(selectedFn.file, selectedFn.signature) : null
  const base = backendBasePath(backendId)
  const pending = backend.status === 'pending'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Backend Explorer"
        description={`${projectRoot} · ${backend.explorerBranch ?? backend.git.branch}`}
        actions={
          <>
            {changedCount > 0 && <Badge tone="warning">{changedCount} files changed</Badge>}
            <Button onClick={() => navigate(`${base}/workflow`)}>
              <Network size={14} /> Open in workflow
            </Button>
          </>
        }
      />

      {pending ? (
        <EmptyState
          icon={Network}
          title="Indexing in progress"
          description="This backend was just added. Connect git sync to populate routes, files and functions."
          action={<Button onClick={() => navigate(base)}>Back to overview</Button>}
        />
      ) : (
        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-white md:flex">
            <div className="border-b border-line px-3 py-2 text-[11px] font-semibold tracking-wide text-ink-muted uppercase">
              Files
            </div>
            <FileTree tree={tree} paths={paths} selectedPath={activeFile} onSelect={selectFile} gitStatus={gitFileStatus} />
          </aside>

          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-col gap-2 border-b border-line bg-white px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs text-ink-muted">
                <select
                  aria-label="Open file"
                  value={activeFile}
                  onChange={(e) => selectFile(e.target.value)}
                  className="max-w-full rounded border border-line bg-white px-2 py-1 text-xs md:hidden"
                >
                  {paths.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <span className="hidden min-w-0 items-center gap-1 truncate font-mono md:flex">
                  {[projectRoot, ...activeFile.split('/')].map((part, idx, arr) => (
                    <span key={`${part}-${idx}`} className="flex items-center gap-1">
                      {part}
                      {idx < arr.length - 1 && <ChevronRight size={12} />}
                    </span>
                  ))}
                </span>
                {gitFileStatus[activeFile] && (
                  <Badge tone={gitFileStatus[activeFile] === 'A' ? 'success' : 'warning'}>Git: {gitFileStatus[activeFile]}</Badge>
                )}
              </div>
              {selectedFn && (
                <div className="animate-fade-in flex flex-wrap items-center gap-2 rounded-md border border-primary-100 bg-primary-50 px-3 py-2">
                  <span className="font-mono text-[13px] font-semibold text-ink">{selectedFn.name}()</span>
                  <Badge tone="primary">{selectedFn.kind}</Badge>
                  <span className="text-xs text-ink-muted">Line {selectedLine}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-ink-muted">{selectedFn.description}</span>
                  <Button size="sm" onClick={() => updateParams({ tab: 'dependencies' })}>
                    Show dependencies
                  </Button>
                </div>
              )}
            </div>

            <div className="min-h-0 flex-1 bg-white">
              <CodeEditor value={sourceFiles[activeFile] ?? ''} language="javascript" readOnly onMount={handleEditorMount} />
            </div>

            <div className="flex h-72 shrink-0 flex-col border-t border-line bg-white">
              <Tabs tabs={tabs} value={tab} onChange={(t) => updateParams({ tab: t })} className="px-3 pt-1" />
              <div className="min-h-0 flex-1 overflow-auto scrollbar-thin">
                {tab === 'functions' && <FunctionsTable selectedName={selectedFn?.name} onSelect={selectFunction} />}
                {tab === 'routes' && <RoutesTable onOpenHandler={(name) => updateParams({ fn: name, tab: 'functions' })} />}
                {tab === 'dependencies' && <DependenciesPanel fn={selectedFn} onSelect={selectFunction} />}
                {tab === 'parameters' && <ParametersPanel fn={selectedFn} />}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
