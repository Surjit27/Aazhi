import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  FolderGit2,
  GitBranch,
  Layers,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import { Field, Input, Select, Textarea } from '../components/ui/FormControls.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import {
  ARCHITECTURES,
  GIT_PROVIDERS,
  architectureLabel,
  backendBasePath,
  backendsVisibleToClient,
  gitProviderLabel,
} from '../data/backends.js'
import { useAppStore } from '../stores/appStore.js'
import { formatDateTime, relativeTime } from '../utils/format.js'
import { NOW_MS } from '../data/executions.js'
import DataTable from '../components/ui/DataTable.jsx'

const STATUS_TONE = { indexed: 'success', pending: 'warning', error: 'danger' }

export default function BackendsPage() {
  const navigate = useNavigate()
  const backends = backendsVisibleToClient(useAppStore((s) => s.backends))
  const addBackend = useAppStore((s) => s.addBackend)
  const pushToast = useAppStore((s) => s.pushToast)
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm())

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return backends
    return backends.filter(
      (b) =>
        `${b.name} ${b.description} ${b.git.repository} ${architectureLabel(b.architecture)}`.toLowerCase().includes(q),
    )
  }, [backends, query])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = () => {
    if (!form.name.trim() || !form.repository.trim()) {
      pushToast({ tone: 'danger', title: 'Missing fields', body: 'Name and repository are required.' })
      return
    }
    const backend = addBackend({ ...form, status: 'pending' })
    setModalOpen(false)
    setForm(emptyForm())
    pushToast({ title: 'Backend added', body: `${backend.name} — indexing will start after git sync.` })
    navigate(backendBasePath(backend.id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Backends"
        description="Configure services from Git, then reverse-engineer routes, code and workflows per backend."
        breadcrumbs={['deepe', 'Dashboards', 'Backends']}
        actions={
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Add backend
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-6 pb-8">
        <div className="relative max-w-md">
          <Search size={14} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, repo or stack"
            className="glass-inset h-9 w-full pr-3 pl-8 text-[13px] focus:border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-50"
          />
        </div>

        <Panel
          title="Configured backends"
          description={`${filtered.length} service${filtered.length === 1 ? '' : 's'}`}
          bodyClassName="p-0"
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No backends match your search"
              description="Try a different query or add a new backend from Git."
              action={
                <Button onClick={() => setModalOpen(true)}>
                  <Plus size={14} /> Add backend
                </Button>
              }
            />
          ) : (
            <DataTable.Root minWidth={880} aria-label="Configured backends">
              <DataTable.Scroll>
                <DataTable.Table>
                  <DataTable.Head sticky={false}>
                    <DataTable.Th>Service</DataTable.Th>
                    <DataTable.Th>Architecture</DataTable.Th>
                    <DataTable.Th>Repository</DataTable.Th>
                    <DataTable.Th>Branch</DataTable.Th>
                    <DataTable.Th>Index</DataTable.Th>
                    <DataTable.Th align="right">Routes</DataTable.Th>
                    <DataTable.Th align="right">Functions</DataTable.Th>
                    <DataTable.Th>Last sync</DataTable.Th>
                    <DataTable.Th align="right">
                      <span className="sr-only">Actions</span>
                    </DataTable.Th>
                  </DataTable.Head>
                  <DataTable.Body>
                    {filtered.map((b) => (
                      <DataTable.Row key={b.id} onClick={() => navigate(backendBasePath(b.id))}>
                        <DataTable.Td>
                          <p className="font-medium text-ink">{b.name}</p>
                          <p className="text-xs text-ink-muted">{b.description}</p>
                        </DataTable.Td>
                        <DataTable.Td>
                          <Badge tone="neutral">{architectureLabel(b.architecture)}</Badge>
                        </DataTable.Td>
                        <DataTable.Td>
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ink">
                            <FolderGit2 size={12} className="text-ink-subtle" />
                            {gitProviderLabel(b.git.provider)} · {b.git.repository}
                          </span>
                        </DataTable.Td>
                        <DataTable.Td>
                          <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                            <GitBranch size={12} /> {b.git.branch}
                          </span>
                        </DataTable.Td>
                        <DataTable.Td>
                          <Badge tone={STATUS_TONE[b.status] ?? 'neutral'}>{b.status}</Badge>
                        </DataTable.Td>
                        <DataTable.Td align="right" className="tabular-nums">
                          {b.stats.routes}
                        </DataTable.Td>
                        <DataTable.Td align="right" className="tabular-nums">
                          {b.stats.functions}
                        </DataTable.Td>
                        <DataTable.Td className="text-xs text-ink-muted">
                          {b.git.lastSyncAt ? relativeTime(b.git.lastSyncAt, NOW_MS) : 'Not synced'}
                        </DataTable.Td>
                        <DataTable.Td align="right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(backendBasePath(b.id))
                            }}
                          >
                            Open <ArrowRight size={12} />
                          </Button>
                        </DataTable.Td>
                      </DataTable.Row>
                    ))}
                  </DataTable.Body>
                </DataTable.Table>
              </DataTable.Scroll>
              <DataTable.FooterBar>
                <span className="font-medium tabular-nums">
                  {filtered.length} service{filtered.length === 1 ? '' : 's'}
                </span>
              </DataTable.FooterBar>
            </DataTable.Root>
          )}
        </Panel>

        <Panel title="How it works" bodyClassName="p-4 text-xs text-ink-muted leading-relaxed">
          <ol className="list-decimal space-y-2 pl-4">
            <li>Add or pick a backend from the table — each row is an isolated reverse-engineering workspace.</li>
            <li>Open Overview for health and activity scoped to that service only.</li>
            <li>Use Backend Explorer and Visual Workflow Builder tabs to inspect code paths and request flows for that backend.</li>
          </ol>
        </Panel>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add backend"
        description="Connect a repository (GitHub, GitLab or Bitbucket). deepe will index it for exploration."
        width="max-w-xl"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submit}>
              <RefreshCw size={14} /> Save &amp; open
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Service name" className="sm:col-span-2">
            <Input value={form.name} onChange={set('name')} placeholder="orders-service" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Textarea rows={2} value={form.description} onChange={set('description')} placeholder="What this backend does" />
          </Field>
          <Field label="Architecture">
            <Select value={form.architecture} onChange={set('architecture')}>
              {ARCHITECTURES.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Local base URL" hint="Used for environment probes">
            <Input value={form.localBaseUrl} onChange={set('localBaseUrl')} placeholder="http://localhost:4000" className="font-mono text-xs" />
          </Field>
          <Field label="Git provider">
            <Select value={form.gitProvider} onChange={set('gitProvider')}>
              {GIT_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Default branch">
            <Input value={form.branch} onChange={set('branch')} placeholder="main" />
          </Field>
          <Field label="Repository" hint="org/repo or workspace/project" className="sm:col-span-2">
            <Input value={form.repository} onChange={set('repository')} placeholder="acme/orders-service" className="font-mono text-xs" />
          </Field>
          <Field label="Clone URL (optional)" className="sm:col-span-2">
            <Input value={form.cloneUrl} onChange={set('cloneUrl')} placeholder="https://github.com/acme/orders-service.git" className="font-mono text-xs" />
          </Field>
        </div>
      </Modal>
    </div>
  )
}

function emptyForm() {
  return {
    name: '',
    description: '',
    architecture: 'node-express',
    gitProvider: 'github',
    repository: '',
    branch: 'main',
    cloneUrl: '',
    localBaseUrl: 'http://localhost:4000',
  }
}
