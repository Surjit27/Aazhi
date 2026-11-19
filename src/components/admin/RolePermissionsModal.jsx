import { useCallback, useEffect, useState } from 'react'
import Button from '../ui/Button.jsx'
import Modal from '../ui/Modal.jsx'
import Switch from '../ui/Switch.jsx'
import { apiFetch } from '../../lib/api.js'
import { permissionLabel } from '../../lib/rolePermissions.js'
import { useAppStore } from '../../stores/appStore.js'

export default function RolePermissionsModal({ role, portal, catalogPath, patchPath, open, onClose, onSaved }) {
  const pushToast = useAppStore((s) => s.pushToast)
  const [catalog, setCatalog] = useState([])
  const [selected, setSelected] = useState([])
  const [saving, setSaving] = useState(false)

  const loadCatalog = useCallback(() => {
    return apiFetch(catalogPath)
      .then((r) => setCatalog(r.permissions ?? []))
      .catch((e) => pushToast({ tone: 'danger', title: 'Could not load permission catalog', body: e.message }))
  }, [catalogPath, pushToast])

  useEffect(() => {
    if (!open || !role) return
    setSelected(role.permissions ?? [])
    loadCatalog()
  }, [open, role, loadCatalog])

  const toggle = (key) => {
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const onSave = async () => {
    setSaving(true)
    try {
      const { role: updated } = await apiFetch(patchPath, { method: 'PATCH', body: { permissions: selected } })
      pushToast({ title: 'Permissions saved', body: updated.key })
      onSaved?.(updated)
      onClose()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not save permissions', body: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (!role) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Page permissions · ${role.label}`}
      description={`Choose which ${portal} portal pages this role may access.`}
      footer={
        <>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" disabled={saving} onClick={onSave}>
            {saving ? 'Saving…' : 'Save permissions'}
          </Button>
        </>
      }
    >
      <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
        {catalog.map((item) => (
          <li
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-ink">{item.label || permissionLabel(portal, item.key)}</p>
              <p className="font-mono text-[10px] text-ink-muted">{item.key}</p>
            </div>
            <Switch
              checked={selected.includes(item.key)}
              onChange={() => toggle(item.key)}
              label={item.label || item.key}
            />
          </li>
        ))}
        {catalog.length === 0 && <p className="text-sm text-ink-muted">Loading catalog…</p>}
      </ul>
    </Modal>
  )
}