import { useEffect, useState } from 'react'

/** False while the tab is in the background — pause timers and heavy motion. */
export function useDocumentVisible() {
  const [visible, setVisible] = useState(
    typeof document === 'undefined' ? true : document.visibilityState === 'visible',
  )

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return visible
}
