import { createContext, useContext, useMemo } from 'react'
import { getBackendCatalog } from '../data/backendCatalog.js'

const BackendExplorerContext = createContext(null)

export function BackendExplorerProvider({ backendId, children }) {
  const catalog = useMemo(() => getBackendCatalog(backendId), [backendId])
  return <BackendExplorerContext.Provider value={catalog}>{children}</BackendExplorerContext.Provider>
}

export function useBackendExplorerCatalog() {
  const ctx = useContext(BackendExplorerContext)
  if (!ctx) throw new Error('useBackendExplorerCatalog must be used within BackendExplorerProvider')
  return ctx
}
