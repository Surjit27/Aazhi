/** Flatten symbol-level nodes for flow view. */

export function collectSymbolNodes(root, out = []) {
  const walk = (n) => {
    if (['function', 'const', 'let', 'class'].includes(n.kind)) {
      out.push(n)
    }
    n.children?.forEach(walk)
  }
  walk(root)
  return out
}
