import Link from 'next/link'
import { DirectionalArrow } from './DirectionalArrow'

type DirectionalLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export function DirectionalLink({ href, children, className = '' }: DirectionalLinkProps) {
  return (
    <Link href={href} className={`btn btn-directional ${className}`.trim()}>
      <span>{children}</span>
      <DirectionalArrow />
    </Link>
  )
}
