'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
        if (data?.full_name) {
          setUserName(data.full_name.split(' ')[0]) // Pega só o primeiro nome
        }
      }
    }
    // Não carrega no login
    if (pathname !== '/login') {
      loadUser()
    }
  }, [pathname, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
              <Image src="/logo.png" alt="Logo FAESA" width={200} height={40} priority className="h-8 sm:h-10 w-auto" />
            </Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/profile" className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition" title="Meu Perfil">
              {userName && (
                <span className="text-sm font-medium">Olá, {userName}</span>
              )}
              <User size={20} />
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-full hover:bg-white/10 transition text-red-300 hover:text-red-400" title="Sair">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
