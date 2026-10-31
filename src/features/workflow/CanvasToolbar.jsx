import { useState } from 'react'
import { useReactFlow } from '@xyflow/react'
import { Maximize2, Redo2, RotateCcw, Trash, Undo2 } from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore.js'
import Button from '../../components/ui/Button.jsx'
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx'

const VIEWS = [
  { id: 'architecture', label: 'Architecture view' },
  { id: 'trace', label: 'Runtime trace' },
]

export default function CanvasToolbar() {
  const view = useWorkflowStore((s) => s.view)
  const setView = useWorkflowStore((s) => s.setView)
  const past = useWorkflowStore((s) => s.past)
  const future = useWorkflowStore((s) => s.future)
  const undo = useWorkflowStore((s) => s.undo)
  const redo = useWorkflowStore((s) => s.redo)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const deleteNodes = useWorkflowStore((s) => s.deleteNodes)
  const resetWorkflow = useWorkflowStore((s) => s.resetWorkflow)
  const { fitView } = useReactFlow()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <>
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center rounded-md border border-line bg-white p-0.5 shadow-card" role="radiogroup" aria-label="Canvas view">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              role="radio"
              aria-checked={view === v.id}
              onClick={() => setView(v.id)}
              className={`cursor-pointer rounded px-3 py-1 text-xs font-medium transition-colors ${
                view === v.id ? 'bg-primary-600 text-white' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="pointer-events-auto flex items-center gap-1 rounded-md border border-line bg-white p-1 shadow-card">
          <IconButton label="Undo (Ctrl+Z)" onClick={undo} disabled={past.length === 0}>
            <Undo2 size={15} />
          </IconButton>
          <IconButton label="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={future.length === 0}>
            <Redo2 size={15} />
          </IconButton>
          <span className="mx-1 h-4 w-px bg-line" />
          <IconButton label="Fit view" onClick={() => fitView({ padding: 0.2, duration: 300 })}>
            <Maximize2 size={15} />
          </IconButton>
          <IconButton label="Delete selected node" onClick={() => selectedNodeId && deleteNodes([selectedNodeId])} disabled={!selectedNodeId}>
            <Trash size={15} />
          </IconButton>
          <IconButton label="Reset to saved workflow" onClick={() => setConfirmReset(true)}>
            <RotateCcw size={15} />
          </IconButton>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset workflow?"
        message="This discards every change made in this session and restores the saved Create Order flow."
        confirmLabel="Reset workflow"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetWorkflow()
          setConfirmReset(false)
          setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50)
        }}
      />
    </>
  )
}

function IconButton({ label, onClick, disabled, children }) {
  return (
    <Button variant="ghost" size="sm" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="h-7 w-7 px-0">
      {children}
    </Button>
  )
}
