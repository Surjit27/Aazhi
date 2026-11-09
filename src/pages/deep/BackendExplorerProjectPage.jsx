import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, GitBranch, Layers, ListTodo, Sparkles, Workflow } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import { Field, Input, Select, Textarea } from '../../components/ui/FormControls.jsx'
import { thClass, tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import DeepFlowStudioWorkspace from '../../features/deep/DeepFlowStudioWorkspace.jsx'
import ArchitectureGraph from '../../features/deep/ArchitectureGraph.jsx'
import { DISCOVERY_STAGES, TREE_PANEL } from '../../data/deepBackend.js'
import { useExplorerProjectsStore } from '../../stores/explorerProjectsStore.js'
import { ReactFlowProvider } from '@xyflow/react'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'agent', label: 'Reverse engineer', icon: Bot },
  { id: 'architecture', label: 'Architecture', icon: Sparkles },
  { id: 'flows', label: 'Flow Studio', icon: Workflow },
  { id: 'issues', label: 'Issues', icon: ListTodo },
]

const ISSUE_TYPES = [
  { value: 'reverse-engineer', label: 'Reverse engineering' },
  { value: 'agent-setup', label: 'AI agent setup' },
  { value: 'flow', label: 'Execution flow' },
]

export default function BackendExplorerProjectPage({ projectId, connectedRepos }) {
  const project = useExplorerProjectsStore((s) => s.projects.find((p) => p.id === projectId))
  const updateProject = useExplorerProjectsStore((s) => s.updateProject)
  const addIssue = useExplorerProjectsStore((s) => s.addIssue)
  const setIssueStatus = useExplorerProjectsStore((s) => s.setIssueStatus)

  const [tab, setTab] = useState('overview')
  const [agentRunning, setAgentRunning] = useState(false)
  const [agentStep, setAgentStep] = useState(0)
  const [issueOpen, setIssueOpen] = useState(false)
  const [issueForm, setIssueForm] = useState({ title: '', type: 'reverse-engineer', description: '' })

  const repos = useMemo(() => {
    const ids = project?.connectedRepoIds ?? []
    const set = new Set(ids)
    return (connectedRepos ?? []).filter((r) => set.has(r.id))
  }, [project?.connectedRepoIds, connectedRepos])

  if (!project) {
    return null
  }

  const runAgent = () => {
    setAgentRunning(true)
    setAgentStep(0)
    updateProject(project.id, { agentStatus: 'running' })
    setTab('agent')
    let step = 0
    const timer = setInterval(() => {
      step += 1
      setAgentStep(step)
      if (step >= DISCOVERY_STAGES.length) {
        clearInterval(timer)
        setAgentRunning(false)
        updateProject(project.id, { agentStatus: 'ready', discoveryComplete: true })
        setTab('architecture')
      }
    }, 550)
  }

  const submitIssue = (e) => {
    e.preventDefault()
    addIssue(project.id, issueForm)
    setIssueForm({ title: '', type: 'reverse-engineer', description: '' })
    setIssueOpen(false)
    setTab('issues')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title={project.name}
        description={project.description || 'Backend reverse engineering and flow design workspace.'}
        breadcrumbs={['deepe', 'Deep Backend', 'Backend Explorer', project.name]}
        actions={
          <>
            <Link to="/deep/explorer">
              <Button variant="ghost">All projects</Button>
            </Link>
            <Button variant="primary" onClick={runAgent} disabled={agentRunning || repos.length === 0}>
              <Sparkles size={14} /> Run reverse-engineer agent
            </Button>
          </>
        }
      />

      <div className="border-b border-line px-6">
        <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 cursor-pointer items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition ${
                tab === id ? 'border-primary-600 text-primary-700' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6">
        {tab === 'overview' && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="glass-inset rounded-lg p-4">
                <p className="text-[10px] font-semibold uppercase text-ink-subtle">Workflow</p>
                <p className="mt-1 text-sm font-semibold text-ink">{project.workflowType === 'multi' ? 'Multi-repo' : 'Mono-repo'}</p>
              </div>
              <div className="glass-inset rounded-lg p-4">
                <p className="text-[10px] font-semibold uppercase text-ink-subtle">Repositories</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-ink">{repos.length}</p>
              </div>
              <div className="glass-inset rounded-lg p-4">
                <p className="text-[10px] font-semibold uppercase text-ink-subtle">Agent</p>
                <Badge tone={project.agentStatus === 'ready' ? 'success' : project.agentStatus === 'running' ? 'warning' : 'neutral'}>
                  {project.agentStatus === 'ready' ? 'Ready' : project.agentStatus === 'running' ? 'Running' : 'Idle'}
                </Badge>
              </div>
            </div>

            <Panel title="Linked repositories" description="Chosen from GitHub connections (Explorer tick). Manage repos under Integrations → GitHub.">
              {repos.length === 0 ? (
                <p className="p-4 text-sm text-ink-muted">
                  No repos in this project.{' '}
                  <Link to="/integrations/github" className="text-primary-600 hover:underline">
                    GitHub connections
                  </Link>{' '}
                  → tick Explorer on repos, then edit the project (UI API later).
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {repos.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <GitBranch size={14} className="text-primary-600" />
                        <div>
                          <p className="text-sm font-medium text-ink">{r.repo}</p>
                          <p className="text-xs text-ink-muted">
                            {r.branch} · {r.framework}
                          </p>
                        </div>
                      </div>
                      {r.private ? <Badge tone="warning">Private</Badge> : null}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </>
        )}

        {tab === 'agent' && (
          <Panel title="Reverse-engineer agent" description="Placeholder pipeline — will call the Python worker to index repos and extract architecture.">
            <div className="grid gap-4 p-4 lg:grid-cols-[1fr_280px]">
              <div>
                <p className="mb-3 text-sm text-ink-muted">
                  Agent scans {repos.length || 'no'} linked {repos.length === 1 ? 'repository' : 'repositories'} and prepares services, APIs, and execution-flow candidates.
                </p>
                <ul className="space-y-2">
                  {DISCOVERY_STAGES.map((label, idx) => {
                    const done = !agentRunning && project.discoveryComplete ? true : idx < agentStep
                    const current = agentRunning && idx === agentStep
                    return (
                      <li key={label} className="flex items-center gap-2 text-sm">
                        <span
                          className={`h-2 w-2 rounded-full ${done ? 'bg-success-600' : current ? 'bg-primary-500 animate-pulse' : 'bg-line'}`}
                        />
                        <span className={done ? 'text-ink' : current ? 'font-medium text-primary-700' : 'text-ink-muted'}>{label}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="glass-inset rounded-lg p-4">
                <p className="text-xs font-semibold uppercase text-ink-subtle">AI agent settings (UI)</p>
                <dl className="mt-3 space-y-2 text-xs text-ink-muted">
                  <div className="flex justify-between gap-2">
                    <dt>Model</dt>
                    <dd className="font-medium text-ink">Workspace default</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Depth</dt>
                    <dd className="font-medium text-ink">Standard scan</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Outputs</dt>
                    <dd className="text-right font-medium text-ink">Graph · flows · issues</dd>
                  </div>
                </dl>
                <Button className="mt-4 w-full" size="sm" variant="secondary" disabled>
                  Configure agent (soon)
                </Button>
              </div>
            </div>
          </Panel>
        )}

        {tab === 'architecture' && (
          <div className="flex min-h-[480px] flex-col overflow-hidden rounded-lg border border-line bg-white">
            {!project.discoveryComplete ? (
              <p className="p-6 text-sm text-ink-muted">Run the reverse-engineer agent to generate the architecture graph (mock data shown after first run).</p>
            ) : (
              <div className="grid min-h-[480px] flex-1 grid-cols-1 lg:grid-cols-[200px_1fr]">
                <aside className="hidden border-r border-line bg-surface/50 p-3 lg:block">
                  {[
                    ['Services', TREE_PANEL.services],
                    ['APIs', TREE_PANEL.apis],
                    ['Functions', TREE_PANEL.functions],
                    ['Execution Flows', TREE_PANEL.flows],
                  ].map(([title, items]) => (
                    <div key={title} className="mb-4">
                      <p className="mb-1 text-[10px] font-semibold uppercase text-ink-subtle">{title}</p>
                      <ul className="space-y-0.5">
                        {items.map((item) => (
                          <li key={item} className="truncate rounded px-2 py-1 text-xs text-ink-muted">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </aside>
                <div className="relative min-h-[360px] min-w-0 flex-1">
                  <ReactFlowProvider>
                    <ArchitectureGraph />
                  </ReactFlowProvider>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'flows' && <DeepFlowStudioWorkspace compact showToolbar projectName={project.name} />}

        {tab === 'issues' && (
          <Panel
            title="Project issues"
            description="Track reverse-engineering tasks, agent setup, and flow work."
            bodyClassName="p-0"
          >
            <div className="flex justify-end border-b border-line px-4 py-2">
              <Button size="sm" variant="primary" onClick={() => setIssueOpen(true)}>
                Create issue
              </Button>
            </div>
            {project.issues.length === 0 ? (
              <p className="p-4 text-sm text-ink-muted">No issues yet. Create one for backend reverse engineering or AI agent setup.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse">
                  <thead className="bg-surface">
                    <tr className="border-b border-line">
                      <th className={thClass}>Title</th>
                      <th className={thClass}>Type</th>
                      <th className={thClass}>Status</th>
                      <th className={thClass} />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {project.issues.map((issue) => (
                      <tr key={issue.id}>
                        <td className={tdClass}>
                          <p className="font-medium text-ink">{issue.title}</p>
                          {issue.description ? <p className="text-xs text-ink-muted">{issue.description}</p> : null}
                        </td>
                        <td className={tdClass}>
                          <Badge tone="neutral">{ISSUE_TYPES.find((t) => t.value === issue.type)?.label ?? issue.type}</Badge>
                        </td>
                        <td className={tdClass}>
                          <Badge tone={issue.status === 'done' ? 'success' : 'warning'}>{issue.status}</Badge>
                        </td>
                        <td className={tdClass}>
                          {issue.status !== 'done' ? (
                            <Button size="sm" variant="ghost" onClick={() => setIssueStatus(project.id, issue.id, 'done')}>
                              Mark done
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        )}
      </div>

      <Modal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        title="Create project issue"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIssueOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" form="explorer-issue-form" type="submit">
              Create
            </Button>
          </>
        }
      >
        <form id="explorer-issue-form" className="grid gap-3" onSubmit={submitIssue}>
          <Field label="Title">
            <Input required value={issueForm.title} onChange={(e) => setIssueForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field label="Type">
            <Select value={issueForm.type} onChange={(e) => setIssueForm((f) => ({ ...f, type: e.target.value }))}>
              {ISSUE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Description">
            <Textarea rows={3} value={issueForm.description} onChange={(e) => setIssueForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
