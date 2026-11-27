import { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'

let monacoBootstrap = null
function ensureMonacoConfigured() {
  if (!monacoBootstrap) {
    monacoBootstrap = import('../../lib/monaco.js')
  }
  return monacoBootstrap
}

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  readOnly = false,
  height = '100%',
  theme = 'vs',
  onMount,
  options,
}) {
  const [monacoReady, setMonacoReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    ensureMonacoConfigured().then(() => {
      if (!cancelled) setMonacoReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!monacoReady) {
    return <div className="p-4 text-xs text-ink-muted">Loading editor...</div>
  }

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme={theme}
      onChange={(next) => onChange?.(next ?? '')}
      onMount={onMount}
      loading={<div className="p-4 text-xs text-ink-muted">Loading editor...</div>}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 12.5,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        lineNumbersMinChars: 3,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        tabSize: 2,
        renderLineHighlight: 'line',
        padding: { top: 8, bottom: 8 },
        ...options,
      }}
    />
  )
}