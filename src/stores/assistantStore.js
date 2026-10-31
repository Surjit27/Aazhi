import { create } from 'zustand'
import { ASSISTANT_CONTEXTS, ASSISTANT_SUGGESTIONS } from '../data/assistant.js'
import { askAssistant } from '../services/mockBackend.js'
import { useWorkflowStore } from './workflowStore.js'
import { useMockStore } from './mockStore.js'
import { useAppStore } from './appStore.js'
import { uid } from '../utils/format.js'

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  text: 'I can explain functions, map dependencies, generate test scenarios, suggest mock responses and propose workflow changes. Nothing is applied until you approve the preview.',
}

export const useAssistantStore = create((set, get) => ({
  messages: [WELCOME],
  contextId: ASSISTANT_CONTEXTS[0].id,
  suggestions: ASSISTANT_SUGGESTIONS,
  contexts: ASSISTANT_CONTEXTS,
  pending: false,

  setContext: (contextId) => set({ contextId }),

  send: async (prompt) => {
    const text = prompt.trim()
    if (!text || get().pending) return
    const { contextId } = get()
    set((s) => ({ messages: [...s.messages, { id: uid('msg'), role: 'user', text }], pending: true }))

    const reply = await askAssistant(text, contextId)
    set((s) => ({
      pending: false,
      messages: [
        ...s.messages,
        {
          id: uid('msg'),
          role: 'assistant',
          text: reply.text,
          list: reply.list ?? null,
          proposal: reply.proposal ?? null,
          proposalStatus: reply.proposal ? 'pending' : null,
          mockPatch: reply.mockPatch ?? null,
          mockStatus: reply.mockPatch ? 'pending' : null,
        },
      ],
    }))
  },

  applyProposal: (messageId) => {
    const msg = get().messages.find((m) => m.id === messageId)
    if (!msg?.proposal) return
    useWorkflowStore.getState().applyProposal(msg.proposal)
    useAppStore.getState().pushToast({ title: 'Workflow updated', body: msg.proposal.title })
    set((s) => ({
      messages: s.messages.map((m) => (m.id === messageId ? { ...m, proposalStatus: 'applied' } : m)),
    }))
  },

  discardProposal: (messageId) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === messageId ? { ...m, proposalStatus: 'discarded' } : m)),
    })),

  applyMockPatch: (messageId) => {
    const msg = get().messages.find((m) => m.id === messageId)
    if (!msg?.mockPatch) return
    const { endpointPath, method, response } = msg.mockPatch
    const mock = useMockStore.getState()
    const server = mock.servers.find((sv) => sv.environment === 'local')
    const endpoint = server?.endpoints.find((ep) => ep.path === endpointPath && ep.method === method)
    if (endpoint) mock.updateEndpoint(server.id, endpoint.id, { response })
    useAppStore.getState().pushToast({ title: 'Mock response updated', body: `${method} ${endpointPath}` })
    set((s) => ({
      messages: s.messages.map((m) => (m.id === messageId ? { ...m, mockStatus: 'applied' } : m)),
    }))
  },
}))
