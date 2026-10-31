import Modal from './Modal.jsx'
import Button from './Button.jsx'

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', tone = 'danger', onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      width="max-w-md"
      footer={
        <>
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'dangerSolid' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-[13px] leading-relaxed text-ink-muted">{message}</p>
    </Modal>
  )
}
