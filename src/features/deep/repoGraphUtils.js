/** Extensions we treat as import-parseable source for the explorer graph. */
const SOURCE_EXT = /\.(js|jsx|ts|tsx|mjs|cjs|py|go)$/i

export function isSourceFilePath(path) {
  return SOURCE_EXT.test(path ?? '')
}

/** Depth-first collect every `kind: 'file'` node from the indexed repo tree. */
export function collectFileNodes(root) {
  const files = []
  function walk(node) {
    if (!node) return
    if (node.kind === 'file') {
      files.push(node)
      return
    }
    for (const child of node.children ?? []) walk(child)
  }
  walk(root)
  return files
}

export function graphStats(root) {
  const files = collectFileNodes(root)
  const sourceFiles = files.filter((f) => isSourceFilePath(f.path))
  let importEdges = 0
  let parsedFiles = 0
  for (const f of sourceFiles) {
    if ((f.uses ?? []).length) parsedFiles += 1
    importEdges += (f.uses ?? []).length
  }
  return {
    totalFiles: files.length,
    sourceFiles: sourceFiles.length,
    parsedFiles,
    importEdges,
    truncated: Boolean(root?._truncated),
  }
}

/**
 * Layout source files on a grid and draw import edges (importer → imported module).
 */
export function buildImportFlowGraph(root, { onlyWithImports = false, query = '', maxNodes = 240 } = {}) {
  let files = collectFileNodes(root).filter((f) => isSourceFilePath(f.path))
  if (onlyWithImports) files = files.filter((f) => (f.uses ?? []).length > 0)
  const q = query.trim().toLowerCase()
  if (q) files = files.filter((f) => `${f.name} ${f.path}`.toLowerCase().includes(q))

  const capped = files.length > maxNodes
  if (capped) files = files.slice(0, maxNodes)

  const idSet = new Set(files.map((f) => f.id))
  const cols = Math.max(1, Math.ceil(Math.sqrt(files.length)))
  const colWidth = 230
  const rowHeight = 88

  const nodes = files.map((file, index) => {
    const importCount = (file.uses ?? []).length
    const importedByCount = (file.usedBy ?? []).filter((id) => idSet.has(id)).length
    return {
      id: file.id,
      type: 'repoFile',
      position: {
        x: (index % cols) * colWidth,
        y: Math.floor(index / cols) * rowHeight,
      },
      data: {
        kind: 'function',
        label: file.name,
        subtitle: file.path,
        file: file.path,
        importCount,
        importedByCount,
        loc: file.loc,
      },
    }
  })

  const edges = []
  for (const file of files) {
    for (const targetId of file.uses ?? []) {
      if (!idSet.has(targetId)) continue
      edges.push({
        id: `import-${file.id}-${targetId}`,
        source: file.id,
        target: targetId,
        label: 'imports',
        animated: false,
        style: { stroke: '#4A90E2', strokeWidth: 1.25 },
        labelStyle: { fontSize: 9, fill: '#5B6676' },
      })
    }
  }

  return { nodes, edges, capped, shown: files.length }
}

/** Directory tree for sidebar (dirs + files, no symbol children). */
export function buildRepoTreeEntries(root) {
  const entries = []
  function walk(node, depth) {
    if (!node) return
    if (node.kind === 'file') {
      entries.push({
        id: node.id,
        kind: 'file',
        name: node.name,
        path: node.path,
        depth,
        importCount: (node.uses ?? []).length,
        importedByCount: (node.usedBy ?? []).length,
      })
      return
    }
    if (node.kind === 'dir') {
      entries.push({ id: node.id, kind: 'dir', name: node.name, path: node.path, depth })
    }
    const children = (node.children ?? []).filter((c) => c.kind === 'dir' || c.kind === 'file')
    children.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    for (const child of children) walk(child, depth + 1)
  }
  walk(root, 0)
  return entries
}