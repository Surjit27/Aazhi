import { create } from 'zustand'
import { uid } from '../utils/format.js'

const STORAGE_KEY = 'deepe_explorer_projects_v1'

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch {
    /* quota */
  }
}

const seed = loadProjects()

export const useExplorerProjectsStore = create((set, get) => ({
  projects: seed,

  createProject: ({ name, description, workflowType, connectedRepoIds }) => {
    const trimmed = String(name ?? '').trim()
    if (!trimmed) return null
    const now = new Date().toISOString()
    const project = {
      id: uid('prj'),
      name: trimmed,
      description: String(description ?? '').trim(),
      workflowType: workflowType === 'multi' ? 'multi' : 'mono',
      connectedRepoIds: Array.isArray(connectedRepoIds) ? connectedRepoIds : [],
      agentStatus: 'idle',
      discoveryComplete: false,
      issues: [],
      createdAt: now,
      updatedAt: now,
    }
    const projects = [project, ...get().projects]
    saveProjects(projects)
    set({ projects })
    return project
  },

  updateProject: (id, patch) => {
    const projects = get().projects.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
    )
    saveProjects(projects)
    set({ projects })
  },

  removeProject: (id) => {
    const projects = get().projects.filter((p) => p.id !== id)
    saveProjects(projects)
    set({ projects })
  },

  addIssue: (projectId, { title, type, description }) => {
    const t = String(title ?? '').trim()
    if (!t) return null
    const issue = {
      id: uid('iss'),
      title: t,
      type: type || 'reverse-engineer',
      description: String(description ?? '').trim(),
      status: 'open',
      createdAt: new Date().toISOString(),
    }
    const projects = get().projects.map((p) =>
      p.id === projectId ? { ...p, issues: [issue, ...p.issues], updatedAt: new Date().toISOString() } : p,
    )
    saveProjects(projects)
    set({ projects })
    return issue
  },

  setIssueStatus: (projectId, issueId, status) => {
    const projects = get().projects.map((p) => {
      if (p.id !== projectId) return p
      return {
        ...p,
        issues: p.issues.map((i) => (i.id === issueId ? { ...i, status } : i)),
        updatedAt: new Date().toISOString(),
      }
    })
    saveProjects(projects)
    set({ projects })
  },
}))
