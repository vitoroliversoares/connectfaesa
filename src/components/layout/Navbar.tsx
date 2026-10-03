'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut, Moon, Sun, Users, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { logoutAction } from '@/actions/auth'

export function Brand({ href = '/' }: { href?: string }) {
  return <Link href={href} className="brand-lockup" aria-label="Connect FAESA, início">
    <Image className="brand-mark" src="/logo.png" width={36} height={36} alt="" priority />
    <span>Connect FAESA</span>
  </Link>
}

export function Navbar() {
  const pathname = usePathname()
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDark(document.documentElement.classList.contains('dark')))
    return () => cancelAnimationFrame(frame)
  }, [])
  const toggleTheme = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.theme = next ? 'dark' : 'light'
    setDark(next)
  }

  if (pathname === '/login' || pathname === '/onboarding' || pathname === '/reset-password') return null
  if (pathname === '/') return <header className="site-header"><div className="shell site-header-inner">
    <Brand />
    <nav className="site-links" aria-label="Navegação principal">
      <a href="#como-funciona" className="about-link">Como funciona</a>
      <Link href="/login">Entrar</Link>
      <Link href="/login?mode=register" className="btn btn-primary">Criar conta</Link>
    </nav>
  </div></header>

  return <header className="app-nav"><div className="shell app-nav-inner">
    <Brand href="/dashboard" />
    <nav className="app-nav-links" aria-label="Navegação da plataforma">
      <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`} aria-current={pathname === '/dashboard' ? 'page' : undefined}><Users size={18} /><span>Descobrir</span></Link>
      <Link href="/profile" className={`nav-link ${pathname === '/profile' ? 'active' : ''}`} aria-current={pathname === '/profile' ? 'page' : undefined}><UserRound size={18} /><span>Meu perfil</span></Link>
      <button type="button" className="nav-icon" onClick={toggleTheme} aria-label={dark ? 'Usar tema claro' : 'Usar tema escuro'} title={dark ? 'Tema claro' : 'Tema escuro'}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button>
      <button type="button" className="nav-icon" onClick={() => logoutAction()} aria-label="Sair da conta" title="Sair"><LogOut size={19} /></button>
    </nav>
  </div></header>
}
