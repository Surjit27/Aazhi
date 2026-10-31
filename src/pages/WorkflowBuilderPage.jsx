import { useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useOutletContext } from 'react-router-dom'
import { useWorkflowStore } from '../stores/workflowStore.js'
import { PageHeader } from '../components/ui/Panel.jsx'
import WorkflowCanvas from '../features/workflow/WorkflowCanvas.jsx'
import CanvasToolbar from '../features/workflow/CanvasToolbar.jsx'
import NodePalette from '../features/workflow/NodePalette.jsx'
import NodeConfigPanel from '../features/workflow/NodeConfigPanel.jsx'
import RuntimeTrace from '../features/workflow/RuntimeTrace.jsx'
import ExecutionLogPanel from '../features/workflow/ExecutionLogPanel.jsx'
import AiWorkflowPanel from '../features/workflow/AiWorkflowPanel.jsx'

function useWorkflowShortcuts() {
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) return
      const key = e.key.toLowerCase()
      if (!(e.ctrlKey || e.metaKey) || (key !== 'z' && key !== 'y')) return
      e.preventDefault()
      const { undo, redo } = useWorkflowStore.getState()
      const isRedo = e.key.toLowerCase() === 'y' || e.shiftKey
      if (isRedo) redo()
      else undo()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

function WorkflowBuilderContent() {
  const { backend } = useOutletContext()
  const view = useWorkflowStore((s) => s.view)
  const nodeCount = useWorkflowStore((s) => s.nodes.length)
  useWorkflowShortcuts()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Visual Workflow Builder"
        description={`Request flow diagram for ${backend.name} — map routes, middleware and services, then replay.`}
        actions={<span className="text-xs text-ink-muted tabular-nums">{nodeCount} steps</span>}
      />
      <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card md:mx-6 md:mb-6">
        <div className="flex min-h-[420px] min-w-0 flex-1">
          <NodePalette />
          <div className="relative min-w-0 flex-1">
            <CanvasToolbar />
            <WorkflowCanvas />
          </div>
          <NodeConfigPanel />
        </div>
        {view === 'trace' && <RuntimeTrace />}
        <div className="flex shrink-0 flex-col border-t border-line lg:h-60 lg:flex-row">
          <ExecutionLogPanel />
          <AiWorkflowPanel />
        </div>
      </div>
    </div>
  )
}

export default function WorkflowBuilderPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent />
    </ReactFlowProvider>
  )
}
