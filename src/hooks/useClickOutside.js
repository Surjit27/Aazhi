import { useEffect, useRef } from 'react'

export default function useClickOutside(onOutside, active = true) {
  const ref = useRef(null)
  const handlerRef = useRef(onOutside)
  handlerRef.current = onOutside

  useEffect(() => {
    if (!active) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handlerRef.current()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [active])

  return ref
}
