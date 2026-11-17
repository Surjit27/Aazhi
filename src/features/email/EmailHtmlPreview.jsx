export default function EmailHtmlPreview({ html, subject, fromLabel, className = '' }) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-lg border border-line bg-surface ${className}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white px-3 py-2 text-xs">
        {subject ? (
          <span className="text-ink-muted">
            Subject: <span className="font-medium text-ink">{subject}</span>
          </span>
        ) : null}
        {fromLabel ? (
          <span className="text-ink-muted">
            From: <span className="font-mono text-[11px] text-ink">{fromLabel}</span>
          </span>
        ) : null}
      </div>
      {html ? (
        <iframe
          title="Email HTML preview"
          className="min-h-[420px] w-full flex-1 border-0 bg-white"
          sandbox=""
          srcDoc={html}
        />
      ) : (
        <p className="p-6 text-sm text-ink-muted">Choose a template and refresh preview.</p>
      )}
    </div>
  )
}