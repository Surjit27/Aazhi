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

const FILE_W = 196
const FILE_H = 92
const FILE_GAP = 18
const FOLDER_PAD = 24
const FOLDER_HEADER = 44
const FOLDER_COL_GAP = 56
const FOLDER_ROW_GAP = 72
const MAX_ROW_WIDTH = 1280

function parentDir(filePath) {
  const idx = String(filePath ?? '').lastIndexOf('/')
  if (idx <= 0) return ''
  return filePath.slice(0, idx)
}

function folderNodeId(dir) {
  return `folder:${dir || '__root__'}`
}

/**
 * Layout source files inside folder panels and draw import edges (importer → imported module).
 */
export function buildImportFlowGraph(root, { onlyWithImports = false, query = '', maxNodes = 240 } = {}) {
  let files = collectFileNodes(root).filter((f) => isSourceFilePath(f.path))
  if (onlyWithImports) files = files.filter((f) => (f.uses ?? []).length > 0)
  const q = query.trim().toLowerCase()
  if (q) files = files.filter((f) => `${f.name} ${f.path}`.toLowerCase().includes(q))

  const capped = files.length > maxNodes
  if (capped) files = files.slice(0, maxNodes)

  const idSet = new Set(files.map((f) => f.id))

  const byDir = new Map()
  for (const file of files) {
    const dir = parentDir(file.path)
    if (!byDir.has(dir)) byDir.set(dir, [])
    byDir.get(dir).push(file)
  }

  const dirs = [...byDir.keys()].sort((a, b) => a.localeCompare(b))
  const folderMeta = dirs.map((dir) => {
    const dirFiles = byDir.get(dir)
    const cols = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(dirFiles.length))))
    const rows = Math.ceil(dirFiles.length / cols)
    const innerW = cols * FILE_W + Math.max(0, cols - 1) * FILE_GAP
    const innerH = rows * FILE_H + Math.max(0, rows - 1) * FILE_GAP
    const folderW = innerW + FOLDER_PAD * 2
    const folderH = innerH + FOLDER_PAD * 2 + FOLDER_HEADER
    return { dir, dirFiles, cols, folderW, folderH }
  })

  const nodes = []
  let row = []
  let rowWidth = 0
  let y = 0

  const flushRow = () => {
    if (!row.length) return
    let x = 0
    const rowH = Math.max(...row.map((m) => m.folderH))
    for (const meta of row) {
      const folderId = folderNodeId(meta.dir)
      nodes.push({
        id: folderId,
        type: 'repoFolder',
        position: { x, y },
        data: {
          kind: 'folder',
          label: meta.dir || '(repository root)',
          fileCount: meta.dirFiles.length,
        },
        style: { width: meta.folderW, height: meta.folderH },
        draggable: true,
        selectable: false,
        zIndex: 0,
      })

      meta.dirFiles.forEach((file, index) => {
        const col = index % meta.cols
        const rowIndex = Math.floor(index / meta.cols)
        const importCount = (file.uses ?? []).length
        const importedByCount = (file.usedBy ?? []).filter((id) => idSet.has(id)).length
        nodes.push({
          id: file.id,
          type: 'repoFile',
          parentId: folderId,
          extent: 'parent',
          position: {
            x: FOLDER_PAD + col * (FILE_W + FILE_GAP),
            y: FOLDER_PAD + FOLDER_HEADER + rowIndex * (FILE_H + FILE_GAP),
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
          draggable: true,
          zIndex: 2,
        })
      })

      x += meta.folderW + FOLDER_COL_GAP
    }
    y += rowH + FOLDER_ROW_GAP
    row = []
    rowWidth = 0
  }

  for (const meta of folderMeta) {
    if (rowWidth + meta.folderW > MAX_ROW_WIDTH && row.length) flushRow()
    row.push(meta)
    rowWidth += meta.folderW + FOLDER_COL_GAP
  }
  flushRow()

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
        type: 'smoothstep',
        style: { stroke: '#4A90E2', strokeWidth: 1.35, opacity: 0.85 },
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