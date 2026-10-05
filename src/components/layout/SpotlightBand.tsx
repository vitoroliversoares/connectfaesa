'use client'

import type { PointerEvent, ReactNode } from 'react'

export function SpotlightBand({ children }: { children: ReactNode }) {
  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse') return

    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--spotlight-x', `${event.clientX - bounds.left}px`)
    event.currentTarget.style.setProperty('--spotlight-y', `${event.clientY - bounds.top}px`)
  }

  return <section className="landing-band" onPointerMove={handlePointerMove}>{children}</section>
}
