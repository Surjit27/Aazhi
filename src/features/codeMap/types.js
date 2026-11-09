/** Shared IR for repo → treemap / flow / inspector (analyzer fills this later). */

export const SCOPE_LEVELS = [
  { id: 0, key: 'repo', label: 'Repository', shows: 'repos' },
  { id: 1, key: 'package', label: 'Packages / dirs', shows: 'dirs' },
  { id: 2, key: 'file', label: 'Files', shows: 'files' },
  { id: 3, key: 'symbol', label: 'Functions & types', shows: 'symbols' },
  { id: 4, key: 'member', label: 'Vars & constants', shows: 'members' },
]

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
