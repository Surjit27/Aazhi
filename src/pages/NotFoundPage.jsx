import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'

export default function NotFoundPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <EmptyState
        title="This page doesn't exist"
        description="The link may be out of date, or the page may have moved."
        action={
          <Link to="/overview">
            <Button variant="primary"><ArrowLeft size={13} /> Back to overview</Button>
          </Link>
        }
      />
    </div>
  )
}
