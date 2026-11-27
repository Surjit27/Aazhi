import { useEffect, useRef, useState } from 'react'

/**
 * @param {IntersectionObserverInit} [options]
 * @returns {[import('react').RefObject<HTMLElement | null>, boolean]}
 */
export function useInView(options = { rootMargin: '80px', threshold: 0.05 }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(true)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), options)
    observer.observe(node)
    return () => observer.disconnect()
  }, [options.rootMargin, options.threshold])

  return [ref, inView]
}
