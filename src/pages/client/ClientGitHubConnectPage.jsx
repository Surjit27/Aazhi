import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GitBranch, KeyRound, Settings2, Trash2 } from 'lucide-react'
import { apiFetch } from '../../lib/api.js'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Field, Input } from '../../components/ui/FormControls.jsx'
import { tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import { useClientTable } from '../../hooks/useClientTable.js'
import { LegacyTableFooter, SortableLegacyTh } from '../../features/tables/legacyTable.jsx'
import { useAppStore } from '../../stores/appStore.js'
import { isSuperAdminUser } from '../../lib/accessRoles.js'
import { useAuthStore } from '../../stores/authStore.js'
import { brandBreadcrumbs } from '../../lib/breadcrumbs.js'

const EMPTY_PAT = { accountEmail: '', label: '', token: '' }

const CONNECT_TABS = [
  { id: 'oauth', label: 'Sign in with GitHub' },
  { id: 'pat', label: 'PAT / classic token' },
]

const ACCESS_TONE = { admin: 'primary', write: 'success', read: 'neutral', none: 'warning' }

export default function ClientGitHubConnectPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const me = useAuthStore((s) => s.user)
  const isSuperAdmin = isSuperAdminUser(me)
  const [searchParams, setSearchParams] = useSearchParams()

  const [status, setStatus] = useState(null)
  const [credentials, setCredentials] = useState([])
  const [configureOpen, setConfigureOpen] = useState(false)
  const [connectTab, setConnectTab] = useState('oauth')
  const [patForm, setPatForm] = useState(EMPTY_PAT)
  const [savingPat, setSavingPat] = useState(false)

  const [repoModal, setRepoModal] = useState(null)
  const [repoPayload, setRepoPayload] = useState(null)
  const [repoLoading, setRepoLoading] = useState(false)
  const [privateOnly, setPrivateOnly] = useState(false)

  const credAccessors = useMemo(
    () => ({
      account: (c) => c.accountEmail,
      method: (c) => c.authMethod,
      github: (c) => c.lastGithubLogin,
      scopes: (c) => c.scopes,
    }),
    [],
  )
  const credentialsTable = useClientTable(credentials, {
    pageSize: 15,
    accessors: credAccessors,
    defaultSort: { key: 'account', direction: 'asc' },
  })

  const loadCredentials = useCallback(() => {
    return apiFetch('/api/client/git/credentials')
      .then((r) => setCredentials(r.credentials ?? []))
      .catch((e) => pushToast({ tone: 'danger', title: 'Could not load connections', body: e.message }))
  }, [pushToast])

  const loadStatus = useCallback(() => {
    return apiFetch('/api/client/git/status').then(setStatus).catch(() => setStatus(null))
  }, [])

  useEffect(() => {
    loadStatus()
    loadCredentials()
  }, [loadStatus, loadCredentials])

  useEffect(() => {
    const gh = searchParams.get('github')
    const msg = searchParams.get('message')
    if (gh === 'connected') {
      pushToast({ title: 'GitHub connected', body: 'Account added or updated in your workspace table.' })
      loadCredentials()
      loadStatus()
      setConfigureOpen(false)
      setSearchParams({}, { replace: true })
    }
    if (gh === 'error') {
      pushToast({ tone: 'danger', title: 'GitHub sign-in failed', body: msg || 'Try again or use a PAT.' })
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, pushToast, loadCredentials, loadStatus])

  const onOAuth = async () => {
    try {
      const { authorizeUrl } = await apiFetch('/api/client/git/oauth/start', { method: 'POST' })
      window.location.href = authorizeUrl
    } catch (e) {
      pushToast({ tone: 'danger', title: 'GitHub sign-in unavailable', body: e.message })
    }
  }

  const onSavePat = async (e) => {
    e.preventDefault()
    setSavingPat(true)
    try {
      const res = await apiFetch('/api/client/git/credentials', { method: 'POST', body: { ...patForm, isDefault: false } })
      pushToast({
        title: res.updated ? 'Token updated' : 'Account added',
        body: 'Same email updates the row; other emails stay as separate connections.',
      })
      setPatForm(EMPTY_PAT)
      setConfigureOpen(false)
      loadCredentials()
      loadStatus()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not save token', body: err.message })
    } finally {
      setSavingPat(false)
    }
  }

  const onRemove = async (id) => {
    try {
      await apiFetch(`/api/client/git/credentials/${id}`, { method: 'DELETE' })
      pushToast({ title: 'Connection removed' })
      loadCredentials()
      if (repoModal?.id === id) {
        setRepoModal(null)
        setRepoPayload(null)
      }
    } catch (e) {
      pushToast({ tone: 'danger', title: 'Delete failed', body: e.message })
    }
  }

  const openRepos = async (credential) => {
    setRepoModal(credential)
    setRepoLoading(true)
    setRepoPayload(null)
    try {
      const q = privateOnly ? '?privateOnly=true' : ''
      const data = await apiFetch(`/api/client/git/credentials/${credential.id}/repositories${q}`)
      setRepoPayload(data)
    } catch (e) {
      pushToast({ tone: 'danger', title: 'Could not load repositories', body: e.message })
      setRepoPayload(null)
    } finally {
      setRepoLoading(false)
    }
  }

  const refreshRepos = () => {
    if (repoModal) openRepos(repoModal)
  }

  const toggleExplorerConnection = async (repo, nextConnected) => {
    if (!repoModal) return
    try {
      await apiFetch('/api/client/git/connected-repos', {
        method: 'PUT',
        body: {
          credentialId: repoModal.id,
          githubRepoId: repo.id,
          connected: nextConnected,
          fullName: repo.fullName,
          name: repo.name,
          defaultBranch: repo.defaultBranch || 'main',
          private: repo.private,
          htmlUrl: repo.htmlUrl,
          language: repo.language || '',
        },
      })
      setRepoPayload((p) =>
        p
          ? {
              ...p,
              repos: p.repos.map((r) => (r.id === repo.id ? { ...r, connectedToExplorer: nextConnected } : r)),
            }
          : p,
      )
      pushToast({
        title: nextConnected ? 'Connected to Backend Explorer' : 'Removed from Backend Explorer',
        body: repo.fullName,
      })
    } catch (e) {
      pushToast({ tone: 'danger', title: 'Could not update connection', body: e.message })
    }
  }

  useEffect(() => {
    if (repoModal && !repoLoading) {
      openRepos(repoModal)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch when filter toggles
  }, [privateOnly])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="GitHub connections"
        description="Multiple GitHub accounts for microservices — OAuth and PAT can coexist; one row per account email."
        breadcrumbs={brandBreadcrumbs('Deep Backend', 'GitHub')}
        actions={
          isSuperAdmin ? (
            <Button variant="primary" onClick={() => setConfigureOpen(true)}>
              <Settings2 size={16} /> Configure Git
            </Button>
          ) : null
        }
      />

      <div className="flex flex-col gap-6 px-6 pb-10">
        <Panel title="Connected accounts" description="Each row is a GitHub identity (tenant git_credentials). Use the key to inspect repos.">
          {credentialsTable.total === 0 ? (
            <p className="p-5 text-sm text-ink-muted">
              No accounts yet. {isSuperAdmin ? 'Click Configure Git to add OAuth or a PAT.' : 'Ask a Super admin to configure Git.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse">
                <thead className="bg-surface">
                  <tr className="border-b border-line">
                    <SortableLegacyTh sortKey="account" thProps={credentialsTable.thProps}>
                      Account
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="method" thProps={credentialsTable.thProps}>
                      Method
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="github" thProps={credentialsTable.thProps}>
                      GitHub
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="scopes" thProps={credentialsTable.thProps}>
                      Scopes
                    </SortableLegacyTh>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                      Repos
                    </th>
                    <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {credentialsTable.rows.map((c) => (
                    <tr key={c.id}>
                      <td className={tdClass}>
                        <p className="font-medium text-ink">{c.label || c.accountEmail}</p>
                        <p className="text-xs text-ink-muted">{c.accountEmail}</p>
                      </td>
                      <td className={tdClass}>
                        <Badge tone={c.authMethod === 'oauth' ? 'primary' : 'neutral'}>{c.authMethod === 'oauth' ? 'OAuth' : 'PAT'}</Badge>
                      </td>
                      <td className={`${tdClass} font-mono text-xs`}>{c.lastGithubLogin || '—'}</td>
                      <td className={`${tdClass} max-w-[140px] truncate text-xs text-ink-muted`} title={c.scopes || '—'}>
                        {c.scopes || '—'}
                      </td>
                      <td className={tdClass}>
                        <Button size="sm" variant="secondary" onClick={() => openRepos(c)} title="View accessible repositories">
                          <KeyRound size={14} /> Inspect
                        </Button>
                      </td>
                      <td className={tdClass}>
                        {isSuperAdmin && (
                          <Button size="sm" variant="ghost" onClick={() => onRemove(c.id)} aria-label="Remove">
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <LegacyTableFooter table={credentialsTable} itemLabel="account" />
            </div>
          )}
        </Panel>

        {!status?.oauthEnabled && (
          <p className="text-xs text-ink-muted">
            OAuth env is optional. PAT accounts still work. Server fallback: {status?.envConfigured ? 'GITHUB_TOKEN set' : 'not set'}.
          </p>
        )}
      </div>

      <Modal
        open={configureOpen}
        onClose={() => setConfigureOpen(false)}
        title="Configure Git"
        description="Add or refresh a connection. Same email updates that row; use another email for another org/account."
        footer={
          connectTab === 'pat' ? null : (
            <Button variant="ghost" onClick={() => setConfigureOpen(false)}>
              Close
            </Button>
          )
        }
      >
        <div className="mb-4 inline-flex gap-1 rounded-lg border border-line bg-surface p-0.5" role="tablist">
          {CONNECT_TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={connectTab === id}
              onClick={() => setConnectTab(id)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                connectTab === id ? 'bg-white text-ink shadow-card' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {connectTab === 'oauth' && (
          <div className="grid gap-3">
            <p className="text-sm text-ink-muted">Opens GitHub to authorize private repository access for this workspace.</p>
            {status?.oauthEnabled ? (
              <Button variant="primary" onClick={onOAuth}>
                <GitBranch size={16} /> Continue with GitHub
              </Button>
            ) : (
              <p className="text-xs text-ink-muted">Set GITHUB_CLIENT_ID on the API, or switch to the PAT tab.</p>
            )}
          </div>
        )}

        {connectTab === 'pat' && (
          <form className="grid gap-3" onSubmit={onSavePat}>
            <Field label="GitHub account email">
              <Input
                type="email"
                required
                placeholder="you@gmail.com"
                value={patForm.accountEmail}
                onChange={(e) => setPatForm((f) => ({ ...f, accountEmail: e.target.value }))}
              />
            </Field>
            <Field label="Label">
              <Input value={patForm.label} onChange={(e) => setPatForm((f) => ({ ...f, label: e.target.value }))} placeholder="Org A microservices" />
            </Field>
            <Field label="PAT" hint="Classic repo scope or fine-grained token with repository access.">
              <Input type="password" required autoComplete="off" value={patForm.token} onChange={(e) => setPatForm((f) => ({ ...f, token: e.target.value }))} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setConfigureOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={savingPat}>
                {savingPat ? 'Saving…' : 'Save connection'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={Boolean(repoModal)}
        onClose={() => {
          setRepoModal(null)
          setRepoPayload(null)
        }}
        title={repoModal ? `Repositories · ${repoModal.lastGithubLogin || repoModal.accountEmail}` : 'Repositories'}
        description="Tick repos to list them under Deep Backend → Backend Explorer → Connected backends."
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
              <input type="checkbox" checked={privateOnly} onChange={(e) => setPrivateOnly(e.target.checked)} />
              Private only
            </label>
            <Button size="sm" onClick={refreshRepos} disabled={repoLoading}>
              {repoLoading ? 'Loading…' : 'Refresh'}
            </Button>
          </div>
        }
      >
        {repoLoading && <p className="text-sm text-ink-muted">Fetching from GitHub…</p>}
        {!repoLoading && repoPayload && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Total', repoPayload.stats.total],
                ['Private', repoPayload.stats.private],
                ['Read', repoPayload.stats.read],
                ['Write', repoPayload.stats.write],
              ].map(([label, val]) => (
                <div key={label} className="glass-inset rounded-lg p-3 text-center">
                  <p className="text-lg font-semibold tabular-nums text-ink">{val}</p>
                  <p className="text-[10px] text-ink-muted">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-muted">
              Auth: <strong>{repoPayload.authMethod === 'oauth' ? 'OAuth' : 'PAT'}</strong> · scopes: {repoPayload.scopes || '—'}
            </p>
            <ul className="max-h-72 divide-y divide-line overflow-y-auto rounded-lg border border-line">
              {repoPayload.repos.length === 0 ? (
                <li className="p-4 text-sm text-ink-muted">No repositories match this filter.</li>
              ) : (
                repoPayload.repos.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{r.fullName}</p>
                      <p className="truncate text-xs text-ink-muted">{r.description || r.language || '—'}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-1.5 text-xs text-ink-muted" title="Show in Backend Explorer">
                        <input
                          type="checkbox"
                          checked={Boolean(r.connectedToExplorer)}
                          onChange={(e) => toggleExplorerConnection(r, e.target.checked)}
                        />
                        Explorer
                      </label>
                      {r.private && <Badge tone="warning">Private</Badge>}
                      <Badge tone={ACCESS_TONE[r.access] ?? 'neutral'}>{r.access}</Badge>
                      <a href={r.htmlUrl} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:underline">
                        Open
                      </a>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  )
}
