import { useMemo, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { FolderGit2, GitBranch, Upload, Sparkles, CheckCircle2, Circle } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import { Field, Input, Select } from '../../components/ui/FormControls.jsx'
import { CONNECT_METHODS, DISCOVERY_STAGES, EXECUTION_FLOWS, TREE_PANEL } from '../../data/deepBackend.js'
import { useDeepExplorerStore } from '../../stores/deepExplorerStore.js'
import ArchitectureGraph from '../../features/deep/ArchitectureGraph.jsx'
import ExecutionLogDrawer from '../../features/deep/ExecutionLogDrawer.jsx'
import { ARCHITECTURES } from '../../data/backends.js'

export default function BackendExplorerPage() {
  const backends = useDeepExplorerStore((s) => s.backends)
  const activeBackendId = useDeepExplorerStore((s) => s.activeBackendId)
  const phase = useDeepExplorerStore((s) => s.phase)
  const discoveryStep = useDeepExplorerStore((s) => s.discoveryStep)
  const discovering = useDeepExplorerStore((s) => s.discovering)
  const selectedNodeId = useDeepExplorerStore((s) => s.selectedNodeId)
  const graphNodes = useDeepExplorerStore((s) => s.graphNodes)
  const logsOpen = useDeepExplorerStore((s) => s.logsOpen)
  const selectBackend = useDeepExplorerStore((s) => s.selectBackend)
  const openConnect = useDeepExplorerStore((s) => s.openConnect)
  const startDiscovery = useDeepExplorerStore((s) => s.startDiscovery)
  const addBackend = useDeepExplorerStore((s) => s.addBackend)
  const toggleLogs = useDeepExplorerStore((s) => s.toggleLogs)

  const [connectOpen, setConnectOpen] = useState(false)
  const [form, setForm] = useState({ name: '', repo: '', branch: 'main', framework: 'node-express' })

  const active = backends.find((b) => b.id === activeBackendId) ?? backends[0]
  const selectedNode = graphNodes.find((n) => n.id === selectedNodeId)

  const statCards = useMemo(() => {
    const s = active?.stats
    if (!s) return []
    return [
      ['Services', s.services],
      ['APIs', s.apis],
      ['Functions', s.functions],
      ['Execution Flows', s.executionFlows],
      ['Databases', s.databases],
      ['Events', s.events],
      ['Externals', s.externals],
    ]
  }, [active])

  const openConnectFlow = () => {
    setConnectOpen(true)
    openConnect()
  }

  const submitConnect = () => {
    addBackend(form)
    setConnectOpen(false)
    setForm({ name: '', repo: '', branch: 'main', framework: 'node-express' })
  }

  if (phase === 'workspace' && active?.status === 'discovered') {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          title="Backend Explorer"
          description="Architecture Discovery complete — explore services, APIs, and Execution Flows."
          breadcrumbs={['deepe', 'Deep Backend', 'Backend Explorer']}
          actions={
            <>
              <Button onClick={() => useDeepExplorerStore.setState({ phase: 'home' })}>Connections</Button>
              <Button variant="primary" onClick={() => startDiscovery()}>
                <Sparkles size={14} /> Re-run discovery
              </Button>
            </>
          }
        />
        <div className="flex min-h-0 flex-1 flex-col border-t border-line">
          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_1fr_260px]">
            <aside className="hidden border-r border-line bg-surface/50 p-3 lg:block">
              <TreeSection title="Services" items={TREE_PANEL.services} />
              <TreeSection title="APIs" items={TREE_PANEL.apis} />
              <TreeSection title="Functions" items={TREE_PANEL.functions} />
              <TreeSection title="Execution Flows" items={TREE_PANEL.flows} />
            </aside>
            <div className="relative min-h-[360px] min-w-0 flex-1">
              <ReactFlowProvider>
                <ArchitectureGraph />
              </ReactFlowProvider>
            </div>
            <aside className="border-l border-line bg-white p-4">
              {selectedNode ? (
                <>
                  <p className="text-xs font-semibold uppercase text-ink-subtle">Selection</p>
                  <p className="mt-2 text-sm font-semibold text-ink">{selectedNode.data.label}</p>
                  <p className="text-xs text-ink-muted">{selectedNode.data.file || selectedNode.data.subtitle}</p>
                  <ul className="mt-4 space-y-1 text-xs text-ink-muted">
                    <li>Related Execution Flows: Client Registration Flow</li>
                    <li>Dependencies: 3 inbound · 2 outbound</li>
                    <li>Runtime: healthy (mock)</li>
                  </ul>
                </>
              ) : (
                <p className="text-xs text-ink-muted">Select a node on the graph to inspect APIs, dependencies, and logs.</p>
              )}
            </aside>
          </div>
          <ExecutionLogDrawer open={logsOpen} onClose={toggleLogs} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Backend Explorer"
        description="Discover, visualize, and simulate your backend architecture."
        breadcrumbs={['deepe', 'Deep Backend', 'Backend Explorer']}
        actions={
          <Button variant="primary" onClick={openConnectFlow}>
            Connect Backend
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-6 pb-10">
        {phase === 'discovery' && (
          <Panel title="Architecture Discovery" description="AI-assisted reverse engineering (mock progress)">
            <ul className="space-y-2 p-4">
              {DISCOVERY_STAGES.map((label, idx) => {
                const done = idx < discoveryStep
                const current = idx === discoveryStep && discovering
                return (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    {done ? (
                      <CheckCircle2 size={16} className="text-success-700" />
                    ) : (
                      <Circle size={16} className={current ? 'text-primary-600' : 'text-ink-subtle'} />
                    )}
                    <span className={done ? 'text-ink' : current ? 'font-medium text-primary-700' : 'text-ink-muted'}>{label}</span>
                  </li>
                )
              })}
            </ul>
          </Panel>
        )}

        {phase !== 'discovery' && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {CONNECT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={m.id === 'local'}
                  onClick={m.id !== 'local' ? openConnectFlow : undefined}
                  className="glass-inset cursor-pointer rounded-lg p-4 text-left transition hover:border-primary-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {m.id === 'github' && <GitBranch size={18} className="text-primary-600" />}
                  {m.id === 'zip' && <Upload size={18} className="text-primary-600" />}
                  {m.id === 'local' && <FolderGit2 size={18} className="text-ink-subtle" />}
                  <p className="mt-2 text-sm font-semibold text-ink">{m.label}</p>
                  <p className="text-xs text-ink-muted">{m.description}</p>
                </button>
              ))}
            </div>

            <Panel title="Connected backends" bodyClassName="p-0">
              <ul className="divide-y divide-line">
                {backends.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">{b.name}</p>
                      <p className="text-xs text-ink-muted">
                        {b.repo} · {b.branch} · {b.framework}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={b.status === 'discovered' ? 'success' : 'warning'}>{b.status}</Badge>
                      <Button
                        size="sm"
                        variant={activeBackendId === b.id ? 'primary' : 'secondary'}
                        onClick={() => selectBackend(b.id)}
                      >
                        Select
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          selectBackend(b.id)
                          startDiscovery()
                        }}
                      >
                        <Sparkles size={12} /> Architecture Discovery
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>

            {active?.stats && (
              <Panel title="Discovery summary">
                <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4 lg:grid-cols-7">
                  {statCards.map(([label, val]) => (
                    <div key={label} className="glass-inset rounded-lg p-3 text-center">
                      <p className="text-lg font-semibold tabular-nums text-ink">{val}</p>
                      <p className="text-[10px] text-ink-muted">{label}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            <Panel title="Execution Flows extracted" bodyClassName="p-4">
              <ul className="grid gap-2 sm:grid-cols-2">
                {EXECUTION_FLOWS.map((f) => (
                  <li key={f.id} className="glass-inset rounded-lg px-3 py-2 text-sm font-medium text-ink">
                    {f.name}
                    <span className="ml-2 text-xs font-normal text-ink-muted">{f.steps} steps</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        )}
      </div>

      <Modal
        open={connectOpen}
        onClose={() => setConnectOpen(false)}
        title="Connect backend"
        description="Repository or ZIP upload (mock — saves to local UI state)."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConnectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitConnect}>
              Save connection
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Service name">
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="auth-gateway" />
          </Field>
          <Field label="Repository">
            <Input value={form.repo} onChange={(e) => setForm((f) => ({ ...f, repo: e.target.value }))} placeholder="org/repo" />
          </Field>
          <Field label="Branch">
            <Input value={form.branch} onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))} />
          </Field>
          <Field label="Framework">
            <Select value={form.framework} onChange={(e) => setForm((f) => ({ ...f, framework: e.target.value }))}>
              {ARCHITECTURES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}

function TreeSection({ title, items }) {
  return (
    <div className="mb-4">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-ink-subtle">{title}</p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item} className="cursor-pointer truncate rounded px-2 py-1 text-xs text-ink-muted hover:bg-white">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
