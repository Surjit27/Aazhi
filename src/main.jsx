import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { useAuthStore } from './stores/authStore.js'
import { useFeatureFlagsStore } from './stores/featureFlagsStore.js'
import './index.css'

function Bootstrap() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  const loadClientFlags = useFeatureFlagsStore((s) => s.loadClientFlags)
  useEffect(() => {
    bootstrap().finally(() => loadClientFlags())
  }, [bootstrap, loadClientFlags])

  useEffect(() => {
    const onFocus = () => loadClientFlags()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') loadClientFlags()
    })
    return () => window.removeEventListener('focus', onFocus)
  }, [loadClientFlags])
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Bootstrap />
    </BrowserRouter>
  </StrictMode>,
)
