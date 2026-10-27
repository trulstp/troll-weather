import { useEffect, useRef, useState } from 'react'

/**
 * Renders `placeholder` until the element scrolls near the viewport, then
 * `children`. Used to avoid downloading the chart for visitors who never scroll to it.
 */
function WhenVisible({ children, placeholder, margin = '300px' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (visible) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: margin })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [visible, margin])

  return visible ? children : <div ref={ref}>{placeholder}</div>
}

export default WhenVisible
