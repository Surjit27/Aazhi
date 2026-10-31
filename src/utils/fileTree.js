export function buildFileTree(paths) {
  const root = { name: '', path: '', type: 'folder', children: [] }

  for (const filePath of [...paths].sort()) {
    const parts = filePath.split('/')
    let node = root
    parts.forEach((part, idx) => {
      const path = parts.slice(0, idx + 1).join('/')
      let child = node.children.find((c) => c.name === part)
      if (!child) {
        child = { name: part, path, type: idx === parts.length - 1 ? 'file' : 'folder', children: [] }
        node.children.push(child)
      }
      node = child
    })
  }

  const sortChildren = (node) => {
    node.children.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1))
    node.children.forEach((c) => c.type === 'folder' && sortChildren(c))
  }
  sortChildren(root)
  return root.children
}

export function folderPaths(paths) {
  const folders = new Set()
  paths.forEach((p) => {
    const parts = p.split('/')
    for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join('/'))
  })
  return folders
}

// Returns the last line of a top-level function, assuming its closing brace sits at column zero.
export function functionEndLine(source, startLine) {
  const lines = source.split('\n')
  for (let i = startLine; i < lines.length; i++) {
    if (lines[i] === '}') return i + 1
  }
  return startLine
}
