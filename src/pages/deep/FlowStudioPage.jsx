import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import { PageHeader } from '../../components/ui/Panel.jsx'
import FlowPlayground from '../../features/codeMap/FlowPlayground.jsx'

/** Standalone entry — open a Backend Explorer project for mapped repos. */
export default function FlowStudioPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Flow playground"
        description="2D zoom canvas for repos linked in Backend Explorer — files, dependencies, and syntax symbols."
        breadcrumbs={['deepe', 'Deep Backend', 'Flow playground']}
        actions={
          <Link to="/deep/explorer">
            <Button variant="primary" size="sm">
              Go to projects
            </Button>
          </Link>
        }
      />
      <div className="mx-6 mb-6 min-h-0 flex-1">
        <FlowPlayground linkedRepos={[]} />
      </div>
    </div>
  )
}
