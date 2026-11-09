import { SCOPE_LEVELS } from './types.js'

const KIND_MAX_DEPTH = {
  repo: 0,
  dir: 1,
  file: 2,
  module: 2,
  function: 3,
  class: 3,
  const: 4,
  let: 4,
  import: 3,
  export: 3,
}

/** Weight for treemap tile size (compress large deps visually). */
export function nodeWeight(node) {
  if (node.loc > 0) return node.loc
  if (node.children?.length) return node.children.reduce((s, c) => s + nodeWeight(c), 0)
  return 8
}

/** Filter tree by scope slider (0–4). */
export function filterTreeByScope(node, scopeLevel) {
  const maxKindDepth = SCOPE_LEVELS[scopeLevel]?.id ?? 4
  const prune = (n) => {
    const depth = KIND_MAX_DEPTH[n.kind] ?? 2
    const next = { ...n }
    if (depth > maxKindDepth) return null
    if (n.children?.length) {
      next.children = n.children.map(prune).filter(Boolean)
    }
    return next
  }
  return prune(node)
}

/**
 * Simple row-based treemap: split parent width by child weights.
 * Returns layout rects in % for CSS absolute positioning.
 */
export function layoutTreemap(node, box = { x: 0, y: 0, w: 100, h: 100 }) {
  if (!node.children?.length) {
    return [{ node, x: box.x, y: box.y, w: box.w, h: box.h }]
  }
  const children = node.children
  const total = children.reduce((s, c) => s + nodeWeight(c), 0) || 1
  let cursor = box.x
  const out = []
  for (const child of children) {
    const share = (nodeWeight(child) / total) * box.w
    const childBox = { x: cursor, y: box.y, w: share, h: box.h }
    cursor += share
    if (child.children?.length) {
      out.push(...layoutTreemap(child, childBox))
    } else {
      out.push({ node: child, ...childBox })
    }
  }
  return out
}
