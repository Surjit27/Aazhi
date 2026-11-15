import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LayoutGrid, Plus, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import { Field, Input, Textarea } from '../../components/ui/FormControls.jsx'
import { tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import { useClientTable } from '../../hooks/useClientTable.js'
import { LegacyTableFooter, SortableLegacyTh } from '../../features/tables/legacyTable.jsx'
import { usePagerStore } from '../../stores/pagerStore.js'
import { formatDateTime } from '../../utils/format.js'
import PagerProjectPage from './PagerProjectPage.jsx'

const STATUS_TONE = { live: 'success', saved: 'primary', draft: 'neutral' }

export default function PagerPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const projects = usePagerStore((s) => s.projects)
  const createProject = usePagerStore((s) => s.createProject)
  const removeProject = usePagerStore((s) => s.removeProject)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const accessors = useMemo(
    () => ({
      name: (p) => p.name,
      status: (p) => p.status,
      nodes: (p) => p.nodes?.length ?? 0,
      host: (p) => (p.tempHost ? 1 : 0),
      updatedAt: (p) => p.updatedAt,
    }),
    [],
  )
  const table = useClientTable(projects, {
    pageSize: 15,
    accessors,
    defaultSort: { key: 'updatedAt', direction: 'desc' },
  })

  if (projectId) {
    const exists = projects.some((p) => p.id === projectId)
    if (!exists) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
          <p className="text-sm text-ink-muted">Pager project not found.</p>
          <Link to="/deep/pager">
            <Button>Back to Pager</Button>
          </Link>
        </div>
      )
    }
    return <PagerProjectPage projectId={projectId} />
  }

  const submitCreate = (e) => {
    e.preventDefault()
    const created = createProject(form)
    if (created) {
      setCreateOpen(false)
      setForm({ name: '', description: '' })
      navigate(`/deep/pager/${created.id}`)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Pager"
        description="Pager projects hold hostable event workflows — open one to design on the canvas with AI."
        breadcrumbs={['deepe', 'Deep Backend', 'Pager']}
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> New Pager project
          </Button>
        }
      />

      <div className="px-6 pb-10">
        <Panel
          title="Pager projects"
          description="Each project is a saved workflow you can host temporarily and run for event simulation."
          bodyClassName="p-0"
        >
          {table.total === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <LayoutGrid size={32} className="text-ink-subtle" />
              <p className="max-w-md text-sm text-ink-muted">Create a Pager project, then build nodes, AI steps, and a temp host URL inside.</p>
              <Button variant="primary" onClick={() => setCreateOpen(true)}>
                <Plus size={14} /> New Pager project
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead className="bg-surface">
                  <tr className="border-b border-line">
                    <SortableLegacyTh sortKey="name" thProps={table.thProps}>
                      Project
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="status" thProps={table.thProps}>
                      Status
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="nodes" thProps={table.thProps}>
                      Nodes
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="host" thProps={table.thProps}>
                      Host
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="updatedAt" thProps={table.thProps}>
                      Updated
                    </SortableLegacyTh>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {table.rows.map((p) => (
                    <tr key={p.id} className="hover:bg-surface/60">
                      <td className={tdClass}>
                        <Link to={`/deep/pager/${p.id}`} className="text-sm font-semibold text-primary-700 hover:underline">
                          {p.name}
                        </Link>
                        {p.description ? <p className="text-xs text-ink-muted">{p.description}</p> : null}
                      </td>
                      <td className={tdClass}>
                        <Badge tone={STATUS_TONE[p.status] ?? 'neutral'}>{p.status}</Badge>
                      </td>
                      <td className={`${tdClass} tabular-nums`}>{p.nodes?.length ?? 0}</td>
                      <td className={tdClass}>
                        {p.tempHost ? (
                          <span className="font-mono text-[10px] text-success-700">live</span>
                        ) : (
                          <span className="text-xs text-ink-muted">—</span>
                        )}
                      </td>
                      <td className={`${tdClass} text-xs text-ink-muted`}>{formatDateTime(p.updatedAt)}</td>
                      <td className={tdClass}>
                        <div className="flex justify-end gap-1">
                          <Link to={`/deep/pager/${p.id}`}>
                            <Button size="sm" variant="secondary">
                              Open
                            </Button>
                          </Link>
                          <Button size="sm" variant="ghost" aria-label="Delete" onClick={() => removeProject(p.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <LegacyTableFooter table={table} itemLabel="project" />
            </div>
          )}
        </Panel>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New Pager project"
        description="You'll land in the canvas editor to add nodes and ask Pager AI."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" form="new-pager-project" type="submit">
              Create & open
            </Button>
          </>
        }
      >
        <form id="new-pager-project" className="grid gap-3" onSubmit={submitCreate}>
          <Field label="Project name">
            <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Staging webhook sim" />
          </Field>
          <Field label="Description">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
