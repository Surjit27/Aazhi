import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { FolderKanban, GitBranch, Plus, Trash2 } from 'lucide-react'
import { apiFetch } from '../../lib/api.js'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import { Field, Input, Select, Textarea } from '../../components/ui/FormControls.jsx'
import { thClass, tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import { useExplorerProjectsStore } from '../../stores/explorerProjectsStore.js'
import BackendExplorerProjectPage from './BackendExplorerProjectPage.jsx'

const WORKFLOW_OPTIONS = [
  { value: 'mono', label: 'Mono-repo (single service)' },
  { value: 'multi', label: 'Multi-repo (microservices)' },
]

export default function BackendExplorerPage() {
  const navigate = useNavigate()
  const { projectId } = useParams()
  const projects = useExplorerProjectsStore((s) => s.projects)
  const createProject = useExplorerProjectsStore((s) => s.createProject)
  const removeProject = useExplorerProjectsStore((s) => s.removeProject)

  const [connectedRepos, setConnectedRepos] = useState([])
  const [reposLoading, setReposLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    workflowType: 'mono',
    connectedRepoIds: [],
  })

  useEffect(() => {
    let cancelled = false
    setReposLoading(true)
    apiFetch('/api/client/git/connected-repos')
      .then((r) => {
        if (!cancelled) setConnectedRepos(r.backends ?? [])
      })
      .catch(() => {
        if (!cancelled) setConnectedRepos([])
      })
      .finally(() => {
        if (!cancelled) setReposLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeProject = projectId ? projects.find((p) => p.id === projectId) : null

  if (projectId) {
    if (!activeProject) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <p className="text-sm text-ink-muted">Project not found.</p>
          <Link to="/deep/explorer">
            <Button>Back to projects</Button>
          </Link>
        </div>
      )
    }
    return <BackendExplorerProjectPage projectId={projectId} connectedRepos={connectedRepos} />
  }

  const toggleRepo = (id) => {
    setForm((f) => {
      const has = f.connectedRepoIds.includes(id)
      const connectedRepoIds = has ? f.connectedRepoIds.filter((x) => x !== id) : [...f.connectedRepoIds, id]
      const workflowType =
        connectedRepoIds.length > 1 ? 'multi' : connectedRepoIds.length === 1 ? 'mono' : f.workflowType
      return { ...f, connectedRepoIds, workflowType }
    })
  }

  const submitCreate = (e) => {
    e.preventDefault()
    const created = createProject(form)
    if (created) {
      setCreateOpen(false)
      setForm({ name: '', description: '', workflowType: 'mono', connectedRepoIds: [] })
      navigate(`/deep/explorer/${created.id}`)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Backend Explorer"
        description="Projects group GitHub-linked repos, reverse-engineering, and Flow Studio — connect repos under GitHub connections."
        breadcrumbs={['deepe', 'Deep Backend', 'Backend Explorer']}
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> New project
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-6 pb-10">
        <Panel
          title="Explorer projects"
          description="Each project is a mono- or multi-repo workflow. Open a row for the agent, architecture graph, flows, and issues."
          bodyClassName="p-0"
        >
          {projects.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <FolderKanban size={32} className="text-ink-subtle" />
              <p className="max-w-md text-sm text-ink-muted">
                Create a project and attach repositories you enabled in{' '}
                <Link to="/integrations/github" className="font-medium text-primary-600 hover:underline">
                  GitHub connections
                </Link>{' '}
                (Inspect → Explorer).
              </p>
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                <Plus size={14} /> New project
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead className="bg-surface">
                  <tr className="border-b border-line">
                    <th className={thClass}>Project</th>
                    <th className={thClass}>Workflow</th>
                    <th className={thClass}>Repos</th>
                    <th className={thClass}>Agent</th>
                    <th className={thClass}>Issues</th>
                    <th className={thClass} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-surface/60">
                      <td className={tdClass}>
                        <Link to={`/deep/explorer/${p.id}`} className="text-sm font-semibold text-primary-700 hover:underline">
                          {p.name}
                        </Link>
                        {p.description ? <p className="text-xs text-ink-muted">{p.description}</p> : null}
                      </td>
                      <td className={tdClass}>
                        <Badge tone={p.workflowType === 'multi' ? 'primary' : 'neutral'}>
                          {p.workflowType === 'multi' ? 'Multi-repo' : 'Mono-repo'}
                        </Badge>
                      </td>
                      <td className={`${tdClass} tabular-nums`}>{p.connectedRepoIds?.length ?? 0}</td>
                      <td className={tdClass}>
                        <Badge tone={p.agentStatus === 'ready' ? 'success' : p.agentStatus === 'running' ? 'warning' : 'neutral'}>
                          {p.agentStatus === 'ready' ? 'Ready' : p.agentStatus === 'running' ? 'Running' : 'Idle'}
                        </Badge>
                      </td>
                      <td className={`${tdClass} tabular-nums`}>{p.issues?.length ?? 0}</td>
                      <td className={tdClass}>
                        <div className="flex justify-end gap-1">
                          <Link to={`/deep/explorer/${p.id}`}>
                            <Button size="sm" variant="secondary">
                              Open
                            </Button>
                          </Link>
                          <Button size="sm" variant="ghost" aria-label="Delete project" onClick={() => removeProject(p.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {!reposLoading && connectedRepos.length === 0 ? (
          <p className="text-xs text-ink-muted">
            <GitBranch size={12} className="mr-1 inline" />
            No Explorer-linked repos yet — use GitHub connections → Inspect → Explorer checkbox.
          </p>
        ) : null}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New explorer project"
        description="Pick repos already linked from GitHub. Workflow type auto-suggests from selection count."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" form="new-explorer-project" type="submit">
              Create project
            </Button>
          </>
        }
      >
        <form id="new-explorer-project" className="grid gap-4" onSubmit={submitCreate}>
          <Field label="Project name">
            <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Platform services" />
          </Field>
          <Field label="Description">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>
          <Field label="Workflow type">
            <Select value={form.workflowType} onChange={(e) => setForm((f) => ({ ...f, workflowType: e.target.value }))}>
              {WORKFLOW_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Repositories" hint="Only repos ticked in GitHub Inspect appear here.">
            {reposLoading ? (
              <p className="text-sm text-ink-muted">Loading linked repos…</p>
            ) : connectedRepos.length === 0 ? (
              <p className="text-sm text-ink-muted">
                None available.{' '}
                <Link to="/integrations/github" className="text-primary-600 hover:underline">
                  Configure GitHub
                </Link>
              </p>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-line p-2">
                {connectedRepos.map((r) => (
                  <li key={r.id}>
                    <label className="flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface">
                      <input type="checkbox" checked={form.connectedRepoIds.includes(r.id)} onChange={() => toggleRepo(r.id)} />
                      <span>
                        <span className="font-medium text-ink">{r.repo}</span>
                        <span className="block text-xs text-ink-muted">
                          {r.branch} · {r.framework}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </Field>
        </form>
      </Modal>
    </div>
  )
}
