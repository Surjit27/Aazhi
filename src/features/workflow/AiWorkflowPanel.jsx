import { useEffect, useState } from 'react'
import { Check, Send, X } from 'lucide-react'
import { useAssistantStore } from '../../stores/assistantStore.js'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Input } from '../../components/ui/FormControls.jsx'

const CHIPS = ['Add rate limiting before authentication', 'Explain this flow']
const WORKFLOW_CONTEXT = 'orders-flow'

export default function AiWorkflowPanel() {
  const messages = useAssistantStore((s) => s.messages)
  const pending = useAssistantStore((s) => s.pending)
  const send = useAssistantStore((s) => s.send)
  const setContext = useAssistantStore((s) => s.setContext)
  const applyProposal = useAssistantStore((s) => s.applyProposal)
  const discardProposal = useAssistantStore((s) => s.discardProposal)
  const [input, setInput] = useState('')

  useEffect(() => {
    setContext(WORKFLOW_CONTEXT)
  }, [setContext])

  const submit = (text) => {
    if (!text.trim() || pending) return
    setInput('')
    send(text)
  }

  return (
    <div className="flex h-64 w-full shrink-0 flex-col border-t border-line bg-white lg:h-auto lg:w-80 lg:border-t-0 lg:border-l">
      <div className="border-b border-line px-4 py-2.5">
        <p className="text-[13px] font-semibold text-ink">AI workflow assistant</p>
        <p className="text-[11px] text-ink-muted">Changes are previewed before they are applied</p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 scrollbar-thin">
        {messages.map((m) => (
          <div key={m.id} className={`animate-slide-up flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-full rounded-lg px-3 py-2 text-xs leading-relaxed ${
                m.role === 'user' ? 'bg-primary-600 text-white' : 'border border-line bg-surface text-ink'
              }`}
            >
              {m.text}
            </div>
            {m.proposal && (
              <div className="w-full rounded-lg border border-primary-100 bg-white p-3 shadow-card">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-ink">{m.proposal.title}</p>
                  <Badge tone="primary">Preview</Badge>
                </div>
                <p className="mt-1 text-[11px] text-ink-muted">{m.proposal.summary}</p>
                <ul className="mt-2 space-y-1 text-[11px]">
                  {m.proposal.addNodes.map((n) => (
                    <li key={n.id} className="flex items-center gap-1.5 text-success-700">
                      <Check size={11} /> Add {n.data.label}
                    </li>
                  ))}
                  {m.proposal.removeEdgeIds.map((id) => (
                    <li key={id} className="flex items-center gap-1.5 text-danger-700">
                      <X size={11} /> Replace an existing link
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-end gap-2">
                  {m.proposalStatus === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => discardProposal(m.id)}>Discard</Button>
                      <Button size="sm" variant="primary" onClick={() => applyProposal(m.id)}>Apply</Button>
                    </>
                  )}
                  {m.proposalStatus === 'applied' && <Badge tone="success">Applied</Badge>}
                  {m.proposalStatus === 'discarded' && <Badge>Discarded</Badge>}
                </div>
              </div>
            )}
          </div>
        ))}
        {pending && <p className="animate-pulse text-xs text-ink-muted">Assistant is drafting a response...</p>}
      </div>

      <div className="flex flex-col gap-2 border-t border-line p-3">
        <div className="flex flex-wrap gap-1.5">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => submit(chip)}
              disabled={pending}
              className="cursor-pointer rounded-full border border-line bg-white px-2.5 py-1 text-[11px] text-ink-muted transition-colors hover:border-primary-500 hover:text-primary-700 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit(input)
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a workflow change"
            aria-label="Workflow change request"
          />
          <Button type="submit" variant="primary" disabled={pending || !input.trim()} aria-label="Send">
            <Send size={14} />
          </Button>
        </form>
      </div>
    </div>
  )
}
