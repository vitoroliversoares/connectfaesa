'use client'

import { useEffect, useRef } from 'react'

export function RevealOnScroll({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -24px 0px' })

    container.classList.add('reveal-enabled')
    targets.forEach((target) => observer.observe(target))

    return () => observer.disconnect()
  }, [])

  return <div ref={containerRef} className={className}>{children}</div>
}
