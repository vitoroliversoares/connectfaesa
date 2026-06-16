'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, User, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getUserNameAction, logoutAction } from '@/actions/auth'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    async function loadUser() {
      const name = await getUserNameAction()
      if (name) {
        setUserName(name)
      }
    }
    // Não carrega no login
    if (pathname !== '/login') {
      loadUser()
    }
  }, [pathname])

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }, [])

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setTheme('dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setTheme('light')
    }
  }

  const handleLogout = async () => {
    await logoutAction()
  }

  // Ocultar Navbar na tela de login
  if (pathname === '/login') {
    return null
  }

  return (
    <nav className="w-full bg-faesa-blue text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center py-2">
            <Link href="/dashboard" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Logo FAESA" 
                width={200} 
                height={40} 
                priority 
                className="h-8 sm:h-10 w-auto" 
              />
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-white/10 transition text-white/80 hover:text-white cursor-pointer"
              title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link 
              href="/profile" 
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 text-white transition font-medium" 
              title="Meu Perfil"
            >
              {userName && (
                <span className="text-sm font-medium hidden sm:inline">Olá, {userName}</span>
              )}
              <User size={20} />
            </Link>
            <button 
              onClick={handleLogout} 
              className="p-2 rounded-xl hover:bg-white/10 transition text-red-300 hover:text-red-400 cursor-pointer" 
              title="Sair"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
