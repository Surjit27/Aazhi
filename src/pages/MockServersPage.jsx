import { useState } from 'react'
import { Play, Plus, Square, Trash } from 'lucide-react'
import { useMockStore } from '../stores/mockStore.js'
import { useAppStore } from '../stores/appStore.js'
import { sendTestRequest } from '../services/mockBackend.js'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, { MethodBadge } from '../components/ui/Badge.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import Switch from '../components/ui/Switch.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { Field, Input, Select } from '../components/ui/FormControls.jsx'
import { thClass, tdClass } from '../features/explorer/ExplorerInsights.jsx'
import { uid } from '../utils/format.js'

const ENV_TABS = [
  { id: 'local', label: 'Localhost' },
  { id: 'staging', label: 'Staging' },
]

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

export default function MockServersPage() {
  const servers = useMockStore((s) => s.servers)
  const selectedServerId = useMockStore((s) => s.selectedServerId)
  const selectServer = useMockStore((s) => s.selectServer)
  const toggleServerRunning = useMockStore((s) => s.toggleServerRunning)
  const updateServer = useMockStore((s) => s.updateServer)
  const pushToast = useAppStore((s) => s.pushToast)
  const [envTab, setEnvTab] = useState('local')
  const [testEndpoint, setTestEndpoint] = useState(null)
  const [editingEndpoint, setEditingEndpoint] = useState(null)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const server = servers.find((sv) => sv.environment === envTab) ?? servers[0]
  const active = server && server.id === selectedServerId ? server : server
  if (!active) return null

  const toggleRunning = () => {
    toggleServerRunning(active.id)
    pushToast({
      tone: active.running ? 'warning' : 'success',
      title: active.running ? `${active.name} stopped` : `${active.name} started`,
      body: `Listening on :${active.port}`,
    })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Mock servers"
        description="Client home on localhost. This page is not part of the admin console, and the orders service is not available here."
        actions={
          <Tabs tabs={ENV_TABS} value={envTab} onChange={(id) => { setEnvTab(id); selectServer(servers.find((sv) => sv.environment === id)?.id) }} />
        }
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:p-6 lg:grid-cols-[280px_1fr]">
        <Panel title={active.name} description={`Port ${active.port}`}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Badge tone={active.running ? 'success' : 'neutral'}>{active.running ? 'Running' : 'Stopped'}</Badge>
              <Button size="sm" variant={active.running ? 'secondary' : 'primary'} onClick={toggleRunning}>
                {active.running ? <><Square size={12} /> Stop</> : <><Play size={12} /> Start</>}
              </Button>
            </div>
            <Field label="Server name">
              <Input value={active.name} onChange={(e) => updateServer(active.id, { name: e.target.value })} />
            </Field>
            <p className="text-xs text-ink-muted">
              {active.endpoints.length} endpoints · {active.endpoints.filter((ep) => ep.enabled).length} enabled
            </p>
          </div>
        </Panel>

        <Panel
          title="Endpoints"
          description="Responses served by this mock server"
          actions={<Button size="sm" variant="primary" onClick={() => setAdding(true)}><Plus size={13} /> Add endpoint</Button>}
          bodyClassName="p-0"
        >
          {active.endpoints.length === 0 ? (
            <EmptyState icon={Plus} title="No endpoints yet" description="Add an endpoint to start serving mock responses." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="border-b border-line bg-surface">
                  <tr>
                    <th className={thClass}>Route</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Latency</th>
                    <th className={thClass}>Error injection</th>
                    <th className={thClass}>Enabled</th>
                    <th className={thClass}><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {active.endpoints.map((ep) => (
                    <tr key={ep.id} className="transition-colors hover:bg-surface/60">
                      <td className={tdClass}>
                        <div className="flex items-center gap-2">
                          <MethodBadge method={ep.method} />
                          <button onClick={() => setEditingEndpoint(ep)} className="cursor-pointer font-mono text-xs text-ink hover:text-primary-700">{ep.path}</button>
                        </div>
                      </td>
                      <td className={tdClass}>{ep.status}</td>
                      <td className={`${tdClass} tabular-nums`}>{ep.latencyMs} ms</td>
                      <td className={tdClass}>
                        {ep.errorInjection.enabled ? (
                          <Badge tone="warning">{ep.errorInjection.status} at {Math.round(ep.errorInjection.probability * 100)}%</Badge>
                        ) : (
                          <span className="text-xs text-ink-subtle">Off</span>
                        )}
                      </td>
                      <td className={tdClass}>
                        <Switch
                          checked={ep.enabled}
                          label={`Enable ${ep.method} ${ep.path}`}
                          onChange={() => useMockStore.getState().updateEndpoint(active.id, ep.id, { enabled: !ep.enabled })}
                        />
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setTestEndpoint(ep)}>Test</Button>
                          <Button size="sm" variant="ghost" aria-label="Delete endpoint" onClick={() => setDeleting(ep)}><Trash size={13} /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <EndpointDrawer
        serverId={active.id}
        endpoint={editingEndpoint}
        open={Boolean(editingEndpoint)}
        onClose={() => setEditingEndpoint(null)}
      />
      <AddEndpointDrawer serverId={active.id} open={adding} onClose={() => setAdding(false)} />
      <TestDrawer endpoint={testEndpoint} onClose={() => setTestEndpoint(null)} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete endpoint?"
        message={deleting ? `${deleting.method} ${deleting.path} will stop responding on this mock server.` : ''}
        confirmLabel="Delete endpoint"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          useMockStore.getState().deleteEndpoint(active.id, deleting.id)
          pushToast({ tone: 'warning', title: 'Endpoint deleted', body: `${deleting.method} ${deleting.path}` })
          setDeleting(null)
        }}
      />
    </div>
  )
}

function EndpointDrawer({ serverId, endpoint, open, onClose }) {
  const updateEndpoint = useMockStore((s) => s.updateEndpoint)
  const pushToast = useAppStore((s) => s.pushToast)
  const [draft, setDraft] = useState(null)
  const [jsonError, setJsonError] = useState(null)

  const current = draft ?? endpoint
  if (!endpoint || !current) return <Drawer open={false} onClose={onClose} title="" />

  const set = (key) => (e) => setDraft({ ...current, [key]: e.target.value })
  const setErr = (key) => (e) => setDraft({ ...current, errorInjection: { ...current.errorInjection, [key]: e.target.value } })

  const save = () => {
    let response = current.response
    if (typeof response === 'string') {
      try {
        response = JSON.parse(response)
      } catch {
        setJsonError('Response must be valid JSON')
        return
      }
    }
    setJsonError(null)
    updateEndpoint(serverId, endpoint.id, {
      status: Number(current.status),
      latencyMs: Number(current.latencyMs),
      response,
      errorInjection: {
        enabled: current.errorInjection.enabled,
        status: Number(current.errorInjection.status),
        probability: Number(current.errorInjection.probability),
      },
    })
    pushToast({ title: 'Endpoint saved', body: `${endpoint.method} ${endpoint.path}` })
    setDraft(null)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={() => { setDraft(null); setJsonError(null); onClose() }}
      title={`${endpoint.method} ${endpoint.path}`}
      description="Response, latency and error injection"
      footer={<div className="flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save}>Save changes</Button></div>}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status code"><Input type="number" value={current.status} onChange={set('status')} /></Field>
          <Field label="Latency (ms)"><Input type="number" value={current.latencyMs} onChange={set('latencyMs')} /></Field>
        </div>
        <Switch
          checked={current.errorInjection.enabled}
          label="Inject errors"
          onChange={() => setDraft({ ...current, errorInjection: { ...current.errorInjection, enabled: !current.errorInjection.enabled } })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Error status"><Input type="number" value={current.errorInjection.status} onChange={setErr('status')} /></Field>
          <Field label="Probability (0-1)"><Input type="number" step="0.05" min="0" max="1" value={current.errorInjection.probability} onChange={setErr('probability')} /></Field>
        </div>
        <Field label="Response JSON" error={jsonError}>
          <textarea
            rows={12}
            value={typeof current.response === 'string' ? current.response : JSON.stringify(current.response, null, 2)}
            onChange={set('response')}
            className="w-full rounded-md border border-line bg-white p-2 font-mono text-xs text-ink focus:border-primary-500 focus:outline-none"
          />
        </Field>
      </div>
    </Drawer>
  )
}

function AddEndpointDrawer({ serverId, open, onClose }) {
  const addEndpoint = useMockStore((s) => s.addEndpoint)
  const pushToast = useAppStore((s) => s.pushToast)
  const [form, setForm] = useState({ method: 'GET', path: '', status: 200 })
  const [error, setError] = useState(null)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = () => {
    if (!form.path.startsWith('/')) {
      setError('Path must start with /')
      return
    }
    addEndpoint(serverId, {
      id: uid('ep'),
      method: form.method,
      path: form.path,
      enabled: true,
      status: Number(form.status),
      latencyMs: 80,
      errorInjection: { enabled: false, status: 500, probability: 0 },
      requestSchema: {},
      response: {},
    })
    pushToast({ title: 'Endpoint added', body: `${form.method} ${form.path}` })
    setForm({ method: 'GET', path: '', status: 200 })
    setError(null)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add endpoint"
      description="Create a new mock route"
      footer={<div className="flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save}>Add endpoint</Button></div>}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-[120px_1fr] gap-3">
          <Field label="Method">
            <Select value={form.method} onChange={set('method')}>{METHODS.map((m) => <option key={m}>{m}</option>)}</Select>
          </Field>
          <Field label="Path" error={error}>
            <Input value={form.path} onChange={set('path')} placeholder="/api/example" className="font-mono text-xs" />
          </Field>
        </div>
        <Field label="Status code">
          <Input type="number" value={form.status} onChange={set('status')} />
        </Field>
      </div>
    </Drawer>
  )
}

function TestDrawer({ endpoint, onClose }) {
  const [state, setState] = useState({ status: 'idle', result: null, error: null })

  const run = async () => {
    setState({ status: 'loading', result: null, error: null })
    try {
      const result = await sendTestRequest(endpoint)
      setState({ status: 'done', result, error: null })
    } catch (err) {
      setState({ status: 'error', result: null, error: err.message })
    }
  }

  return (
    <Drawer
      open={Boolean(endpoint)}
      onClose={() => { setState({ status: 'idle', result: null, error: null }); onClose() }}
      title="Test request"
      description={endpoint ? `${endpoint.method} ${endpoint.path}` : ''}
      footer={<div className="flex justify-end"><Button variant="primary" onClick={run} disabled={state.status === 'loading'}>{state.status === 'loading' ? 'Sending...' : 'Send request'}</Button></div>}
    >
      {state.status === 'idle' && <p className="text-sm text-ink-muted">Send a sample request to see the response this mock returns.</p>}
      {state.status === 'error' && <p className="rounded-md bg-danger-50 p-3 text-sm text-danger-700">The test request failed: {state.error}</p>}
      {state.status === 'done' && (
        <div className="flex flex-col gap-3">
          <Badge tone={state.result.status < 400 ? 'success' : 'danger'}>HTTP {state.result.status} · {state.result.latencyMs} ms</Badge>
          <pre className="overflow-auto rounded-md border border-line bg-surface p-3 font-mono text-xs text-ink">{JSON.stringify(state.result.body, null, 2)}</pre>
        </div>
      )}
    </Drawer>
  )
}
