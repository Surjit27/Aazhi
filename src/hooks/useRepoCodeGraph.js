import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api.js'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForIndexJob(connectedRepoId, jobId) {
  const base = `/api/client/explorer/repos/${encodeURIComponent(connectedRepoId)}/index/status`
  const query = jobId != null ? `?jobId=${encodeURIComponent(jobId)}` : ''
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const status = await apiFetch(`${base}${query}`)
    if (status.status === 'success') return status
    if (status.status === 'failed') {
      const err = new Error(status.error || 'Repository indexing failed')
      err.status = 403
      throw err
    }
    await sleep(2000)
  }
  throw new Error('Indexing timed out — try Refresh index in a minute')
}

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
      const queued = await apiFetch(`/api/client/explorer/repos/${encodeURIComponent(connectedRepoId)}/index`, {
        method: 'POST',
      })
      if (queued?.async) {
        await waitForIndexJob(connectedRepoId, queued.jobId)
      }
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