export default function RouteLoadingFallback() {
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-sm text-ink-muted" role="status" aria-live="polite">
      Loading…
    </div>
  )
}