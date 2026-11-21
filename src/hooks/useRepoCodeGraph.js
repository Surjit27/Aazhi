import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api.js'

export function useRepoCodeGraph(connectedRepoId) {
  const [meta, setMeta] = useState(null)
  const [graphRoot, setGraphRoot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [indexing, setIndexing] = useState(false)
  const [error, setError] = useState(null)
  const [needsIndex, setNeedsIndex] = useState(false)

  const loadGraph = useCallback(async () => {
    if (!connectedRepoId) {
      setGraphRoot(null)
      setMeta(null)
      setNeedsIndex(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch(`/api/client/explorer/repos/${encodeURIComponent(connectedRepoId)}/graph`)
      setGraphRoot(data.graph)
      setMeta({
        branch: data.branch,
        commitSha: data.commitSha,
        fileCount: data.fileCount,
        symbolCount: data.symbolCount,
        indexedAt: data.indexedAt,
      })
      setNeedsIndex(false)
    } catch (err) {
      if (err.status === 404) {
        setGraphRoot(null)
        setMeta(null)
        setNeedsIndex(true)
        setError(null)
      } else {
        setError(err.message ?? 'Could not load repo graph')
      }
    } finally {
      setLoading(false)
    }
  }, [connectedRepoId])

  const indexRepo = useCallback(async () => {
    if (!connectedRepoId) return
    setIndexing(true)
    setError(null)
    try {
      await apiFetch(`/api/client/explorer/repos/${encodeURIComponent(connectedRepoId)}/index`, { method: 'POST' })
      await loadGraph()
    } catch (err) {
      setError(err.message ?? 'Indexing failed')
    } finally {
      setIndexing(false)
    }
  }, [connectedRepoId, loadGraph])

  useEffect(() => {
    loadGraph()
  }, [loadGraph])

  return {
    meta,
    graphRoot,
    loading,
    indexing,
    error,
    needsIndex,
    reload: loadGraph,
    indexRepo,
  }
}