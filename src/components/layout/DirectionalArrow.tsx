import { ArrowRight } from 'lucide-react'

export function DirectionalArrow() {
  return (
    <span className="btn-directional-icon" aria-hidden="true">
      <span><ArrowRight size={18} /></span>
      <span><ArrowRight size={18} /></span>
    </span>
  )
}
