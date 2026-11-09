import { MOCK_CODE_MAP_ROOTS } from './mockRepoIndex.js'
import { collectSymbolNodes } from './collectSymbols.js'

const ZOOM_LAYERS = [
  { id: 0, key: 'repo', label: 'Repositories' },
  { id: 1, key: 'file', label: 'Files' },
  { id: 2, key: 'dependencies', label: 'File dependencies' },
  { id: 3, key: 'syntax', label: 'Syntax & symbols' },
]

export { ZOOM_LAYERS }

function cloneTree(node) {
  return JSON.parse(JSON.stringify(node))
}

function shortRepoName(repoSlug) {
  if (!repoSlug) return 'repository'
  const part = repoSlug.split('/').filter(Boolean).pop()
  return part || repoSlug
}

/** Prefer persisted API graphs; fall back to mock index. */
export function resolveMappedRepoTrees(linkedRepos, apiGraphByRepoId = {}) {
  if (!linkedRepos?.length) return []
  return linkedRepos.map((r, i) => {
    const apiRoot = apiGraphByRepoId[r.id]
    if (apiRoot) {
      return {
        ...apiRoot,
        id: apiRoot.id ?? `repo-${r.id}`,
        kind: 'repo',
        name: apiRoot.name ?? shortRepoName(r.repo ?? r.fullName ?? ''),
        path: apiRoot.path ?? (r.repo ?? r.fullName),
      }
    }
    const slug = r.repo ?? r.fullName ?? r.name ?? `repo-${r.id}`
    const short = shortRepoName(slug)
    const mock =
      MOCK_CODE_MAP_ROOTS.find(
        (m) => slug.includes(m.name) || short === m.name || slug.toLowerCase().includes(m.name.toLowerCase()),
      ) ?? MOCK_CODE_MAP_ROOTS[i % MOCK_CODE_MAP_ROOTS.length]
    const tree = cloneTree(mock)
    tree.id = `repo-${r.id ?? i}`
    tree.kind = 'repo'
    tree.name = short
    tree.path = slug
    return tree
  })
}

function walkFiles(repo, out = []) {
  const visit = (n, repoId) => {
    if (n.kind === 'file') out.push({ ...n, repoId, repoName: repo.name })
    n.children?.forEach((c) => visit(c, repoId))
  }
  visit(repo, repo.id)
  return out
}

function buildIdIndex(repos) {
  const byId = new Map()
  for (const repo of repos) {
    const walk = (n, fileId) => {
      let f = fileId
      if (n.kind === 'file') f = n.id
      byId.set(n.id, { node: n, fileId: f, repoId: repo.id })
      n.children?.forEach((c) => walk(c, f))
    }
    walk(repo, null)
  }
  return byId
}

/** @returns {{ items: object[], edges: { from: string, to: string }[] }} */
export function layerPayload(zoomLevel, repos, focusRepoId, focusFileId) {
  const edges = []

  if (zoomLevel === 0) {
    return {
      items: repos.map((r) => ({
        id: r.id,
        kind: 'repo',
        name: r.name,
        path: r.path,
        loc: r.loc,
        meta: `${(r.children ?? []).length ? walkFiles(r).length : 0} files (indexed)`,
      })),
      edges: [],
    }
  }

  const scopedRepos = focusRepoId ? repos.filter((r) => r.id === focusRepoId) : repos

  if (zoomLevel === 1) {
    const files = scopedRepos.flatMap((r) => walkFiles(r))
    return {
      items: files.map((f) => ({
        id: f.id,
        kind: 'file',
        name: f.name,
        path: f.path,
        loc: f.loc,
        repoId: f.repoId,
        meta: f.repoName,
      })),
      edges: [],
    }
  }

  const idIndex = buildIdIndex(scopedRepos)

  if (zoomLevel === 2) {
    const files = scopedRepos.flatMap((r) => walkFiles(r))
    const edgeSet = new Set()
    for (const file of files) {
      const symbols = collectSymbolNodes(file)
      for (const sym of symbols) {
        for (const useId of sym.uses ?? []) {
          const target = idIndex.get(useId)
          if (!target?.fileId || target.fileId === file.id) continue
          const key = `${file.id}->${target.fileId}`
          if (!edgeSet.has(key)) {
            edgeSet.add(key)
            edges.push({ from: file.id, to: target.fileId })
          }
        }
      }
    }
    return {
      items: files.map((f) => ({
        id: f.id,
        kind: 'file',
        name: f.name,
        path: f.path,
        loc: f.loc,
        repoId: f.repoId,
        meta: `${edges.filter((e) => e.from === f.id || e.to === f.id).length} links`,
      })),
      edges,
    }
  }

  // syntax
  const symbols = []
  if (focusFileId) {
    const fileNode = idIndex.get(focusFileId)?.node
    if (fileNode) symbols.push(...collectSymbolNodes(fileNode))
  } else {
    scopedRepos.forEach((repo) => {
      walkFiles(repo).forEach((f) => symbols.push(...collectSymbolNodes(f)))
    })
  }

  const symEdgeSet = new Set()
  for (const sym of symbols) {
    for (const useId of sym.uses ?? []) {
      if (!symbols.some((s) => s.id === useId)) continue
      const key = `${sym.id}->${useId}`
      if (!symEdgeSet.has(key)) {
        symEdgeSet.add(key)
        edges.push({ from: sym.id, to: useId })
      }
    }
  }

  return {
    items: symbols.map((s) => ({
      id: s.id,
      kind: s.kind,
      name: s.name,
      path: s.signature ?? s.scope,
      loc: s.loc,
      meta: (s.uses?.length ?? 0) ? `uses ${s.uses.length}` : 'leaf',
    })),
    edges,
  }
}

export function layoutGrid(items, { boxW = 168, boxH = 88, gap = 28, cols = 4 } = {}) {
  return items.map((item, i) => ({
    ...item,
    x: gap + (i % cols) * (boxW + gap),
    y: gap + Math.floor(i / cols) * (boxH + gap),
    w: boxW,
    h: boxH,
  }))
}

export function canvasExtent(boxes, padding = 80) {
  if (!boxes.length) return { width: 640, height: 400 }
  let maxX = 0
  let maxY = 0
  boxes.forEach((b) => {
    maxX = Math.max(maxX, b.x + b.w)
    maxY = Math.max(maxY, b.y + b.h)
  })
  return { width: maxX + padding, height: maxY + padding }
}
