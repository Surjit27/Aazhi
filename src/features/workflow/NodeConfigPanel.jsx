import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Trash, X } from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore.js'
import { BACKEND_FUNCTIONS, SOURCE_FILES } from '../../data/backendSource.js'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select, Textarea } from '../../components/ui/FormControls.jsx'
import { KIND_META } from './nodeKinds.js'
import { formatDuration } from '../../utils/format.js'

const STATUS_OPTIONS = [200, 201, 202, 400, 404, 409, 422, 429, 500, 503]
const SNIPPET_LINES = 12

export default function NodeConfigPanel() {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const node = useWorkflowStore((s) => s.nodes.find((n) => n.id === selectedNodeId))
  const selectNode = useWorkflowStore((s) => s.selectNode)

  if (!node) return null

  return (
    <aside className="animate-slide-in-right flex w-80 shrink-0 flex-col border-l border-line bg-white">
      <NodeForm key={node.id} node={node} onClose={() => selectNode(null)} />
    </aside>
  )
}

function NodeForm({ node, onClose }) {
  const navigate = useNavigate()
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData)
  const deleteNodes = useWorkflowStore((s) => s.deleteNodes)
  const meta = KIND_META[node.data.kind]
  const Icon = meta.icon
  const hasRuntimeSettings = !['endpoint', 'condition', 'event', 'mock'].includes(node.data.kind)
  const [initial] = useState(() => ({
    label: node.data.label,
    description: node.data.description ?? '',
    method: node.data.method ?? 'GET',
    path: node.data.path ?? '',
    mockStatus: node.data.mockStatus ?? 200,
    timeoutMs: node.data.timeoutMs ?? 0,
    retries: node.data.retries ?? 0,
  }))
  const [draft, setDraft] = useState(initial)

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial)
  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))

  const apply = () => {
    const patch = { label: draft.label.trim() || node.data.label, description: draft.description }
    if (node.data.kind === 'endpoint') Object.assign(patch, { method: draft.method, path: draft.path, subtitle: draft.path })
    if (node.data.kind === 'mock') patch.mockStatus = Number(draft.mockStatus)
    if (hasRuntimeSettings) Object.assign(patch, { timeoutMs: Number(draft.timeoutMs), retries: Number(draft.retries) })
    updateNodeData(node.id, patch)
  }

  const fn = BACKEND_FUNCTIONS.find((f) => f.name === node.data.label)
  const snippet = node.data.file && SOURCE_FILES[node.data.file] ? buildSnippet(node.data.file, node.data.line) : null

  return (
    <>
      <div className="flex items-start gap-3 border-b border-line px-4 py-3">
        <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-surface" style={{ color: meta.accent }}>
          <Icon size={15} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-wide text-ink-muted uppercase">{meta.label}</p>
          <p className="truncate text-sm font-semibold text-ink">{node.data.label}</p>
        </div>
        <button onClick={onClose} aria-label="Close node panel" className="cursor-pointer rounded p-1 text-ink-muted hover:bg-surface hover:text-ink">
          <X size={15} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 scrollbar-thin">
        <Field label="Name">
          <Input value={draft.label} onChange={set('label')} />
        </Field>

        {node.data.kind === 'endpoint' && (
          <div className="grid grid-cols-[88px_1fr] gap-2">
            <Field label="Method">
              <Select value={draft.method} onChange={set('method')}>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
            <Field label="Path">
              <Input value={draft.path} onChange={set('path')} className="font-mono text-xs" />
            </Field>
          </div>
        )}

        {node.data.kind === 'mock' && (
          <Field label="Status code">
            <Select value={draft.mockStatus} onChange={set('mockStatus')}>
              {STATUS_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="Description">
          <Textarea rows={3} value={draft.description} onChange={set('description')} className="font-sans text-[13px]" />
        </Field>

        {hasRuntimeSettings && (
          <div className="grid grid-cols-2 gap-2">
            <Field label="Timeout (ms)">
              <Input type="number" min={0} value={draft.timeoutMs} onChange={set('timeoutMs')} />
            </Field>
            <Field label="Retries">
              <Input type="number" min={0} max={5} value={draft.retries} onChange={set('retries')} />
            </Field>
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-md border border-line bg-surface p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wide text-ink-muted uppercase">Source</p>
            {node.data.file && <Badge>{node.data.file.split('/').pop()}</Badge>}
          </div>
          {snippet ? (
            <pre className="scrollbar-thin max-h-48 overflow-auto rounded border border-line bg-white p-2 font-mono text-[11px] leading-5 text-ink">
              {snippet.map((row) => (
                <span key={row.n} className={`block ${row.hit ? 'bg-primary-50 -mx-2 px-2' : ''}`}>
                  <span className="mr-3 inline-block w-5 text-right text-ink-subtle select-none">{row.n}</span>
                  {row.text || ' '}
                </span>
              ))}
            </pre>
          ) : (
            <p className="text-xs text-ink-muted">This step is not backed by source code.</p>
          )}
          {node.data.file && (
            <Button
              size="sm"
              onClick={() => navigate(fn ? `/explorer?fn=${fn.name}` : '/explorer?tab=routes')}
              className="self-start"
            >
              Open in Backend Explorer <ArrowUpRight size={13} />
            </Button>
          )}
        </div>

        {node.data.durationMs > 0 && (
          <p className="text-xs text-ink-muted">Typical duration: <span className="font-medium text-ink">{formatDuration(node.data.durationMs)}</span></p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-surface px-4 py-3">
        <Button variant="danger" size="sm" onClick={() => deleteNodes([node.id])}>
          <Trash size={13} /> Delete
        </Button>
        <Button variant="primary" size="sm" onClick={apply} disabled={!dirty}>
          Apply changes
        </Button>
      </div>
    </>
  )
}

function buildSnippet(file, line) {
  const lines = SOURCE_FILES[file].split('\n')
  const start = Math.max(1, (line ?? 1) - 1)
  return lines.slice(start - 1, start - 1 + SNIPPET_LINES).map((text, idx) => ({
    n: start + idx,
    text,
    hit: start + idx === line,
  }))
}
