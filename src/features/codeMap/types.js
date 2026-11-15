/** Shared IR for Flow playground symbol nodes (API graph + demo fallbacks). */

export const KIND_STYLES = {
  repo: { label: 'Repo', tone: 'violet' },
  dir: { label: 'Folder', tone: 'neutral' },
  file: { label: 'File', tone: 'primary' },
  module: { label: 'Module', tone: 'teal' },
  function: { label: 'Function', tone: 'success' },
  class: { label: 'Class', tone: 'cyan' },
  const: { label: 'Const', tone: 'amber' },
  let: { label: 'Variable', tone: 'warning' },
  import: { label: 'Import', tone: 'neutral' },
  export: { label: 'Export', tone: 'primary' },
}

/** @typedef {'repo'|'dir'|'file'|'module'|'function'|'class'|'const'|'let'|'import'|'export'} CodeMapKind */

/**
 * @typedef {Object} CodeMapNode
 * @property {string} id
 * @property {CodeMapKind} kind
 * @property {string} name
 * @property {string} [path]
 * @property {number} [loc]
 * @property {'global'|'module'|'function'|'block'} [scope]
 * @property {string} [signature]
 * @property {string[]} [usedBy]
 * @property {string[]} [uses]
 * @property {CodeMapNode[]} [children]
 */
