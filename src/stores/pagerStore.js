import { create } from 'zustand'
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import {
  PAGER_INITIAL_EDGES,
  PAGER_INITIAL_NODES,
  PAGER_TEMPLATES,
} from '../data/pager.js'
import { uid } from '../utils/format.js'

const STORAGE_KEY = 'deepe_pager_projects_v2'

function emptyGraph() {
  return {
    nodes: [{ id: uid('pg'), type: 'pagerNode', position: { x: 80, y: 120 }, data: { kind: 'trigger', label: 'Start', subtitle: 'Webhook' } }],
    edges: [],
  }
}

function defaultProject() {
  const now = new Date().toISOString()
  return {
    id: 'pg_default',
    name: 'Client onboarding sim',
    description: 'Webhook → AI → HTTP → temp host',
    status: 'draft',
    nodes: PAGER_INITIAL_NODES,
    edges: PAGER_INITIAL_EDGES,
    tempHost: null,
    aiMessages: [{ id: 'm0', role: 'assistant', text: 'Describe an event workflow — I’ll add nodes you can host on Pager.' }],
    updatedAt: now,
    createdAt: now,
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.projects?.length) return parsed
    }
    const legacy = localStorage.getItem('deepe_pager_workflows_v1')
    if (legacy) {
      const old = JSON.parse(legacy)
      if (old?.workflows?.length) {
        return {
          projects: old.workflows.map((w) => ({
            id: w.id,
            name: w.name,
            description: '',
            status: w.status ?? 'draft',
            nodes: w.nodes ?? [],
            edges: w.edges ?? [],
            tempHost: w.tempHost ?? null,
            aiMessages: [{ id: uid('msg'), role: 'assistant', text: 'Migrated workflow — edit freely.' }],
            updatedAt: w.updatedAt ?? new Date().toISOString(),
            createdAt: w.updatedAt ?? new Date().toISOString(),
          })),
          activeProjectId: old.activeWorkflowId ?? old.workflows[0].id,
        }
      }
    }
  } catch {
    /* */
  }
  const p = defaultProject()
  return { projects: [p], activeProjectId: p.id }
}

const hydrated = loadState()

export const usePagerStore = create((set, get) => ({
  projects: hydrated.projects,
  activeProjectId: hydrated.activeProjectId,
  selectedNodeId: null,

  persist: () => {
    const { projects, activeProjectId } = get()
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, activeProjectId }))
    } catch {
      /* */
    }
  },

  createProject: ({ name, description }) => {
    const now = new Date().toISOString()
    const graph = emptyGraph()
    const project = {
      id: uid('pgp'),
      name: String(name || 'New Pager project').trim(),
      description: String(description ?? '').trim(),
      status: 'draft',
      nodes: graph.nodes,
      edges: graph.edges,
      tempHost: null,
      aiMessages: [{ id: uid('msg'), role: 'assistant', text: 'Describe an event workflow — I’ll add nodes you can host on Pager.' }],
      updatedAt: now,
      createdAt: now,
    }
    set((s) => ({
      projects: [project, ...s.projects],
      activeProjectId: project.id,
      selectedNodeId: null,
    }))
    get().persist()
    return project
  },

  removeProject: (id) => {
    const projects = get().projects.filter((p) => p.id !== id)
    set({
      projects,
      activeProjectId: projects[0]?.id ?? null,
      selectedNodeId: null,
    })
    get().persist()
  },

  selectProject: (activeProjectId) => {
    set({ activeProjectId, selectedNodeId: null })
    get().persist()
  },

  projectById: (id) => get().projects.find((p) => p.id === id),

  patchProject: (projectId, patch) => {
    set({
      projects: get().projects.map((p) =>
        p.id === projectId ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
      ),
    })
  },

  applyTemplate: (projectId, templateId) => {
    const tpl = PAGER_TEMPLATES.find((t) => t.id === templateId)
    if (!tpl) return
    if (templateId === 'tpl_webhook_sim') {
      get().patchProject(projectId, {
        nodes: PAGER_INITIAL_NODES,
        edges: PAGER_INITIAL_EDGES,
        name: tpl.label,
      })
    } else {
      get().pushAiMessage(projectId, 'user', `Use template: ${tpl.label}`)
      get().pushAiMessage(projectId, 'assistant', `Added a ${tpl.label} sketch — connect Explorer APIs on the HTTP nodes.`)
    }
    get().persist()
  },

  onNodesChange: (projectId, changes) => {
    const p = get().projectById(projectId)
    if (!p) return
    const nodes = applyNodeChanges(changes, p.nodes)
    get().patchProject(projectId, { nodes })
    get().persist()
  },

  onEdgesChange: (projectId, changes) => {
    const p = get().projectById(projectId)
    if (!p) return
    const edges = applyEdgeChanges(changes, p.edges)
    get().patchProject(projectId, { edges })
    get().persist()
  },

  onConnect: (projectId, connection) => {
    const p = get().projectById(projectId)
    if (!p) return
    const edges = addEdge({ ...connection, type: 'smoothstep' }, p.edges)
    get().patchProject(projectId, { edges })
    get().persist()
  },

  selectNode: (selectedNodeId) => set({ selectedNodeId }),

  addNode: (projectId, kind, position, defaults) => {
    const p = get().projectById(projectId)
    if (!p) return
    const id = uid('pg')
    const nodes = [
      ...p.nodes,
      { id, type: 'pagerNode', position, data: { kind, ...defaults } },
    ]
    get().patchProject(projectId, { nodes })
    get().persist()
    set({ selectedNodeId: id })
  },

  saveProject: (projectId) => {
    get().patchProject(projectId, { status: 'saved' })
    get().persist()
  },

  startTempHost: (projectId) => {
    const slug = Math.random().toString(36).slice(2, 8)
    get().patchProject(projectId, {
      status: 'live',
      tempHost: {
        url: `https://${slug}.pager.deepe.local/run`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        label: 'Temporary host (UI mock)',
      },
    })
    get().persist()
  },

  stopTempHost: (projectId) => {
    get().patchProject(projectId, { status: 'saved', tempHost: null })
    get().persist()
  },

  testRun: (projectId) => {
    get().pushAiMessage(projectId, 'assistant', 'Test run completed (mock) — worker trace coming soon.')
    get().patchProject(projectId, { lastTestRunAt: new Date().toISOString() })
    get().persist()
  },

  pushAiMessage: (projectId, role, text) => {
    const p = get().projectById(projectId)
    if (!p) return
    get().patchProject(projectId, {
      aiMessages: [...p.aiMessages, { id: uid('msg'), role, text }],
    })
  },

  aiSuggestWorkflow: (projectId, prompt) => {
    get().pushAiMessage(projectId, 'user', prompt)
    get().pushAiMessage(
      projectId,
      'assistant',
      'Sketch: Webhook → AI payload → HTTP → IF 200 → Emit event. Drag nodes from the left palette.',
    )
    const p = get().projectById(projectId)
    if (p && p.nodes.length < 3) {
      get().patchProject(projectId, { nodes: PAGER_INITIAL_NODES, edges: PAGER_INITIAL_EDGES })
    }
    get().persist()
  },
}))
