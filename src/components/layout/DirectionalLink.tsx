import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type DirectionalLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export function DirectionalLink({ href, children, className = '' }: DirectionalLinkProps) {
  return (
    <Link href={href} className={`btn btn-directional ${className}`.trim()}>
      <span>{children}</span>
      <span className="btn-directional-icon" aria-hidden="true">
        <ArrowRight size={18} />
        <ArrowRight size={18} />
      </span>
    </Link>
  )
}
