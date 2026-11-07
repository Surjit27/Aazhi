import { useState } from 'react'
import { Cloud, Plus, Trash2 } from 'lucide-react'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Field, Input, Select } from '../../components/ui/FormControls.jsx'
import { thClass, tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import { CLOUD_PROVIDERS } from '../../data/orchestration.js'
import { useCloudProvidersStore } from '../../stores/cloudProvidersStore.js'

const EMPTY = {
  label: '',
  region: '',
  accountRef: '',
  schedulerTarget: '',
  roleArn: '',
  projectOrSubscription: '',
  credentialsSet: false,
  defaultForOrchestration: false,
}

export default function CloudIntegrationsPage() {
  const profiles = useCloudProvidersStore((s) => s.profiles)
  const upsertProfile = useCloudProvidersStore((s) => s.upsertProfile)
  const removeProfile = useCloudProvidersStore((s) => s.removeProfile)

  const [tab, setTab] = useState('aws')
  const [modal, setModal] = useState(null)

  const provider = CLOUD_PROVIDERS.find((p) => p.id === tab)
  const rows = profiles.filter((p) => p.providerId === tab)

  const openCreate = () => {
    setModal({
      mode: 'create',
      form: {
        ...EMPTY,
        schedulerTarget: provider?.schedulerService ?? '',
        label: `${provider?.shortLabel ?? tab} — production`,
      },
    })
  }

  const save = () => {
    if (!modal) return
    upsertProfile(tab, modal.mode === 'edit' ? { ...modal.form, id: modal.id } : modal.form)
    setModal(null)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Cloud deployment access"
        description="Connect AWS, GCP, or Azure so Event Scheduler and orchestration pipelines can deploy workers and fire scheduled simulations."
        breadcrumbs={['deepe', 'Integrations', 'Cloud']}
        actions={
          <Button variant="primary" onClick={openCreate}>
            <Plus size={14} /> Add profile
          </Button>
        }
      />

      <div className="border-b border-line px-6">
        <nav className="-mb-px flex gap-1" role="tablist">
          {CLOUD_PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={tab === p.id}
              onClick={() => setTab(p.id)}
              className={`cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                tab === p.id ? 'border-primary-600 text-primary-700' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {p.shortLabel}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex flex-col gap-6 px-6 py-6">
        <Panel title={`${provider?.label} — scheduler integration`} description={provider?.deployHint}>
          <div className="grid gap-3 p-4 sm:grid-cols-3">
            <div className="glass-inset rounded-lg p-3">
              <p className="text-[10px] font-semibold uppercase text-ink-subtle">Managed scheduler</p>
              <p className="mt-1 text-sm font-medium text-ink">{provider?.schedulerService}</p>
            </div>
            <div className="glass-inset rounded-lg p-3 sm:col-span-2">
              <p className="text-[10px] font-semibold uppercase text-ink-subtle">Compute targets (UI)</p>
              <p className="mt-1 text-sm text-ink-muted">{provider?.computeOptions?.join(' · ')}</p>
            </div>
          </div>
        </Panel>

        <Panel title="Deployment profiles" description="Stored locally until tenant cloud_credentials API ships." bodyClassName="p-0">
          {rows.length === 0 ? (
            <p className="p-5 text-sm text-ink-muted">
              <Cloud size={14} className="mr-1 inline" />
              No {provider?.shortLabel} profiles. Add IAM role, region, and scheduler target for orchestration runs.
            </p>
          ) : (
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="bg-surface">
                <tr className="border-b border-line">
                  <th className={thClass}>Profile</th>
                  <th className={thClass}>Region</th>
                  <th className={thClass}>Account</th>
                  <th className={thClass}>Scheduler</th>
                  <th className={thClass}>Default</th>
                  <th className={thClass} />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className={tdClass}>
                      <p className="font-medium text-ink">{r.label}</p>
                      <p className="text-xs text-ink-muted">{r.credentialsSet ? 'Credentials configured (UI)' : 'Credentials pending'}</p>
                    </td>
                    <td className={tdClass}>{r.region || '—'}</td>
                    <td className={`${tdClass} font-mono text-xs`}>{r.accountRef || r.projectOrSubscription || '—'}</td>
                    <td className={tdClass}>{r.schedulerTarget}</td>
                    <td className={tdClass}>{r.defaultForOrchestration ? <Badge tone="primary">Default</Badge> : '—'}</td>
                    <td className={tdClass}>
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setModal({ mode: 'edit', id: r.id, form: { ...r, credentialsSet: r.credentialsSet } })}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="ghost" aria-label="Remove" onClick={() => removeProfile(r.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <p className="text-xs text-ink-muted">
          Backend path (planned): encrypted keys in client schema, worker assumes role in your VPC, EventBridge / Cloud Scheduler triggers Deepe
          orchestration runs linked to Explorer projects.
        </p>
      </div>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit cloud profile' : `Add ${provider?.shortLabel} profile`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save}>
              Save
            </Button>
          </>
        }
      >
        {modal ? (
          <div className="grid gap-3">
            <Field label="Profile name">
              <Input value={modal.form.label} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, label: e.target.value } }))} />
            </Field>
            <Field label="Region">
              <Input
                placeholder={tab === 'aws' ? 'eu-west-1' : tab === 'gcp' ? 'europe-west1' : 'westeurope'}
                value={modal.form.region}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, region: e.target.value } }))}
              />
            </Field>
            {tab === 'aws' && (
              <>
                <Field label="AWS account ID">
                  <Input value={modal.form.accountRef} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, accountRef: e.target.value } }))} />
                </Field>
                <Field label="IAM role ARN (scheduler / worker)">
                  <Input value={modal.form.roleArn} onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, roleArn: e.target.value } }))} />
                </Field>
              </>
            )}
            {tab === 'gcp' && (
              <Field label="GCP project ID">
                <Input
                  value={modal.form.projectOrSubscription}
                  onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, projectOrSubscription: e.target.value } }))}
                />
              </Field>
            )}
            {tab === 'azure' && (
              <Field label="Subscription ID">
                <Input
                  value={modal.form.projectOrSubscription}
                  onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, projectOrSubscription: e.target.value } }))}
                />
              </Field>
            )}
            <Field label="Scheduler / trigger target">
              <Input
                value={modal.form.schedulerTarget}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, schedulerTarget: e.target.value } }))}
              />
            </Field>
            <Field label="Credentials">
              <Select
                value={modal.form.credentialsSet ? 'yes' : 'no'}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, credentialsSet: e.target.value === 'yes' } }))}
              >
                <option value="no">Will configure later</option>
                <option value="yes">Marked as configured (UI only)</option>
              </Select>
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={modal.form.defaultForOrchestration}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, defaultForOrchestration: e.target.checked } }))}
              />
              Default profile for new orchestration pipelines
            </label>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
