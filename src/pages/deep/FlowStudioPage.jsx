import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import { PageHeader } from '../../components/ui/Panel.jsx'
import DeepFlowStudioWorkspace from '../../features/deep/DeepFlowStudioWorkspace.jsx'
import { useDeepFlowStudioStore } from '../../stores/deepFlowStudioStore.js'

/** Legacy route — Flow Studio lives inside an explorer project. */
export default function FlowStudioPage() {
  const [params] = useSearchParams()
  const executionId = params.get('execution')
  const loadExecution = useDeepFlowStudioStore((s) => s.loadExecution)

  useEffect(() => {
    if (executionId) loadExecution(executionId)
  }, [executionId, loadExecution])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Flow Studio"
        description="Open a Backend Explorer project to edit flows in context."
        breadcrumbs={['deepe', 'Deep Backend', 'Flow Studio']}
        actions={
          <Link to="/deep/explorer">
            <Button variant="primary" size="sm">
              Go to projects
            </Button>
          </Link>
        }
      />
      <div className="mx-6 mb-6 min-h-0 flex-1">
        <DeepFlowStudioWorkspace />
      </div>
    </div>
  )
}
