import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { useAssistantStore } from '../stores/assistantStore.js'
import { PageHeader } from '../components/ui/Panel.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import { Input, Select } from '../components/ui/FormControls.jsx'
import { prettyJson } from '../utils/json.js'

export default function AIAssistantPage() {
  const messages = useAssistantStore((s) => s.messages)
  const pending = useAssistantStore((s) => s.pending)
  const suggestions = useAssistantStore((s) => s.suggestions)
  const contexts = useAssistantStore((s) => s.contexts)
  const contextId = useAssistantStore((s) => s.contextId)
  const send = useAssistantStore((s) => s.send)
  const setContext = useAssistantStore((s) => s.setContext)
  const applyProposal = useAssistantStore((s) => s.applyProposal)
  const discardProposal = useAssistantStore((s) => s.discardProposal)
  const applyMockPatch = useAssistantStore((s) => s.applyMockPatch)
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, pending])

  const submit = (text) => {
    if (!text.trim() || pending) return
    setInput('')
    send(text)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="AI Assistant"
        description="Ask about functions, dependencies, tests and mocks. Changes are previewed before they apply."
        actions={
          <Select className="w-56" value={contextId} onChange={(e) => setContext(e.target.value)} aria-label="Context">
            {contexts.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </Select>
        }
      />

      <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card md:mx-6 md:mb-6">
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary-600 text-white' : 'border border-line bg-surface text-ink'}`}>
                {m.text}
                {m.list && (
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {m.list.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </div>

              {m.proposal && (
                <div className="w-full max-w-[85%] rounded-lg border border-primary-100 bg-white p-3 shadow-card">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">{m.proposal.title}</p>
                    <Badge tone="primary">Preview</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{m.proposal.summary}</p>
                  <div className="mt-3 flex justify-end gap-2">
                    {m.proposalStatus === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => discardProposal(m.id)}>Discard</Button>
                        <Button size="sm" variant="primary" onClick={() => applyProposal(m.id)}>Apply to workflow</Button>
                      </>
                    )}
                    {m.proposalStatus === 'applied' && <Badge tone="success">Applied</Badge>}
                    {m.proposalStatus === 'discarded' && <Badge>Discarded</Badge>}
                  </div>
                </div>
              )}

              {m.mockPatch && (
                <div className="w-full max-w-[85%] rounded-lg border border-line bg-white p-3 shadow-card">
                  <p className="text-sm font-semibold text-ink">Mock response for {m.mockPatch.method} {m.mockPatch.endpointPath}</p>
                  <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-surface p-2 font-mono text-[11px] text-ink">{prettyJson(m.mockPatch.response)}</pre>
                  <div className="mt-3 flex justify-end">
                    {m.mockStatus === 'pending' && <Button size="sm" variant="primary" onClick={() => applyMockPatch(m.id)}>Apply to local mock</Button>}
                    {m.mockStatus === 'applied' && <Badge tone="success">Applied</Badge>}
                  </div>
                </div>
              )}
            </div>
          ))}
          {pending && <p className="animate-pulse text-xs text-ink-muted">Assistant is thinking...</p>}
          <div ref={endRef} />
        </div>

        <div className="space-y-3 border-t border-line p-3">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => submit(s.prompt)}
                disabled={pending}
                className="cursor-pointer rounded-full border border-line bg-white px-3 py-1 text-xs text-ink-muted transition-colors hover:border-primary-500 hover:text-primary-700 disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>
          <form className="flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); submit(input) }}>
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your backend" aria-label="Message the assistant" />
            <Button type="submit" variant="primary" disabled={pending || !input.trim()} aria-label="Send message">
              <Send size={14} />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
