import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { useAuthStore } from './stores/authStore.js'
import './lib/monaco.js'
import './index.css'
import '@xyflow/react/dist/style.css'

function Bootstrap() {
  const bootstrap = useAuthStore((s) => s.bootstrap)
  useEffect(() => {
    bootstrap()
  }, [bootstrap])
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Bootstrap />
    </BrowserRouter>
  </StrictMode>,
)
