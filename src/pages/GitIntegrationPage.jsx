import { useMemo, useState } from 'react'
import { GitBranch, GitCommitHorizontal } from 'lucide-react'
import { GIT_REPOSITORIES, GIT_BRANCHES, GIT_COMMITS, GIT_CHANGED_FILES, GIT_MODIFIED_FUNCTIONS, GRAPH_COMPARISON, REGRESSION_SUGGESTIONS } from '../data/git.js'
import { useAppStore } from '../stores/appStore.js'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import { Select } from '../components/ui/FormControls.jsx'
import { tdClass } from '../features/explorer/ExplorerInsights.jsx'
import { useClientTable } from '../hooks/useClientTable.js'
import { LegacyTableFooter, SortableLegacyTh } from '../features/tables/legacyTable.jsx'
import { formatDateTime } from '../utils/format.js'

const RISK_TONE = { high: 'danger', medium: 'warning', low: 'neutral' }
const PRIORITY_TONE = { high: 'danger', medium: 'warning', low: 'neutral' }
const FILE_TONE = { M: 'warning', A: 'success', D: 'danger' }
const CHANGE_TONE = { added: 'success', changed: 'warning' }

export default function GitIntegrationPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [repoId, setRepoId] = useState(GIT_REPOSITORIES[0].id)
  const [tab, setTab] = useState('changes')
  const [branch, setBranch] = useState(GIT_BRANCHES.find((b) => b.current).id)
  const [selectedSuggestions, setSelectedSuggestions] = useState([])
  const repo = GIT_REPOSITORIES.find((r) => r.id === repoId)
  const currentBranch = GIT_BRANCHES.find((b) => b.id === branch)
  const commits = GIT_COMMITS.filter((c) => c.branch === branch)

  const fileAccessors = useMemo(
    () => ({
      path: (f) => f.path,
      status: (f) => f.status,
      changes: (f) => f.additions + f.deletions,
    }),
    [],
  )
  const filesTable = useClientTable(GIT_CHANGED_FILES, {
    pageSize: 15,
    accessors: fileAccessors,
    defaultSort: { key: 'path', direction: 'asc' },
  })

  const toggleSuggestion = (id) =>
    setSelectedSuggestions((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const queueTests = () => {
    pushToast({ title: 'Regression tests queued', body: `${selectedSuggestions.length} scenarios for ${currentBranch.name}` })
    setSelectedSuggestions([])
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Git Integration"
        description="Compare branches by behaviour, not just by lines of code."
        actions={
          <Select className="w-56" value={repoId} onChange={(e) => setRepoId(e.target.value)} aria-label="Repository">
            {GIT_REPOSITORIES.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        }
      />

      <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
        <Tabs
          tabs={[
            { id: 'changes', label: 'Changes' },
            { id: 'compare', label: 'Graph comparison' },
            { id: 'regression', label: 'Regression suggestions', count: REGRESSION_SUGGESTIONS.length },
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === 'changes' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
            <Panel title="Branches" description={repo.name} bodyClassName="p-2">
              <ul className="space-y-1">
                {GIT_BRANCHES.map((b) => (
                  <li key={b.id}>
                    <button
                      onClick={() => setBranch(b.id)}
                      className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] transition-colors ${
                        branch === b.id ? 'bg-primary-50 text-primary-700' : 'text-ink hover:bg-surface'
                      }`}
                    >
                      <GitBranch size={14} className="shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{b.name}</span>
                      <span className="text-[11px] text-ink-muted tabular-nums">+{b.ahead} -{b.behind}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>

            <div className="flex min-w-0 flex-col gap-4">
              <Panel title="Changed files" description={`${GIT_CHANGED_FILES.length} files on ${currentBranch.name}`} bodyClassName="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left">
                    <thead className="border-b border-line bg-surface">
                      <tr>
                        <SortableLegacyTh sortKey="path" thProps={filesTable.thProps}>
                          File
                        </SortableLegacyTh>
                        <SortableLegacyTh sortKey="status" thProps={filesTable.thProps}>
                          Status
                        </SortableLegacyTh>
                        <SortableLegacyTh sortKey="changes" thProps={filesTable.thProps}>
                          Changes
                        </SortableLegacyTh>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {filesTable.rows.map((f) => (
                        <tr key={f.path} className="hover:bg-surface/60">
                          <td className={`${tdClass} font-mono text-xs`}>{f.path}</td>
                          <td className={tdClass}><Badge tone={FILE_TONE[f.status]}>{f.status}</Badge></td>
                          <td className={`${tdClass} tabular-nums`}><span className="text-success-700">+{f.additions}</span> <span className="text-danger-700">-{f.deletions}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <LegacyTableFooter table={filesTable} itemLabel="file" />
                </div>
              </Panel>

              <Panel title="Modified functions" description="Behaviour changes found by the engine">
                <ul className="divide-y divide-line">
                  {GIT_MODIFIED_FUNCTIONS.map((f) => (
                    <li key={f.name} className="flex flex-wrap items-center gap-2 py-2.5">
                      <span className="font-mono text-xs font-medium text-ink">{f.name}</span>
                      <Badge tone={RISK_TONE[f.risk]}>{f.risk} risk</Badge>
                      <span className="text-xs text-ink-muted">{f.change}</span>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title="Recent commits" description={`On ${currentBranch.name}`} bodyClassName="p-0">
                {commits.length === 0 ? (
                  <p className="p-4 text-xs text-ink-muted">No commits on this branch.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {commits.map((c) => (
                      <li key={c.id} className="flex items-center gap-3 px-4 py-2.5">
                        <GitCommitHorizontal size={14} className="shrink-0 text-ink-muted" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] text-ink">{c.message}</p>
                          <p className="text-[11px] text-ink-muted">{c.author} · {formatDateTime(c.time)}</p>
                        </div>
                        <span className="font-mono text-[11px] text-ink-subtle">{c.id}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          </div>
        )}

        {tab === 'compare' && (
          <Panel title="Flow graph comparison" description={`${GRAPH_COMPARISON.base.label} vs ${GRAPH_COMPARISON.head.label}`}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[GRAPH_COMPARISON.base, GRAPH_COMPARISON.head].map((g) => (
                <div key={g.label} className="rounded-md border border-line bg-surface p-4">
                  <p className="font-mono text-xs font-semibold text-ink">{g.label}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
                    <dt className="text-ink-muted">Nodes</dt><dd className="text-right tabular-nums">{g.nodes}</dd>
                    <dt className="text-ink-muted">Edges</dt><dd className="text-right tabular-nums">{g.edges}</dd>
                    <dt className="text-ink-muted">Endpoints</dt><dd className="text-right tabular-nums">{g.endpoints}</dd>
                    <dt className="text-ink-muted">External calls</dt><dd className="text-right tabular-nums">{g.externalCalls}</dd>
                  </dl>
                </div>
              ))}
            </div>
            <ul className="mt-4 space-y-2">
              {GRAPH_COMPARISON.changes.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-sm text-ink">
                  <Badge tone={CHANGE_TONE[c.type]}>{c.type}</Badge> {c.label}
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === 'regression' && (
          <Panel
            title="Suggested regression tests"
            description="Select scenarios to queue for this branch"
            actions={<Button size="sm" variant="primary" disabled={selectedSuggestions.length === 0} onClick={queueTests}>Queue {selectedSuggestions.length || ''} tests</Button>}
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-line">
              {REGRESSION_SUGGESTIONS.map((r) => (
                <li key={r.id}>
                  <label className="flex cursor-pointer items-start gap-3 px-4 py-3 hover:bg-surface/60">
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.includes(r.id)}
                      onChange={() => toggleSuggestion(r.id)}
                      className="mt-1 h-3.5 w-3.5 accent-primary-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink">{r.title}</p>
                      <p className="text-xs text-ink-muted">{r.reason}</p>
                    </div>
                    <Badge tone={PRIORITY_TONE[r.priority]}>{r.priority}</Badge>
                  </label>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </div>
  )
}
