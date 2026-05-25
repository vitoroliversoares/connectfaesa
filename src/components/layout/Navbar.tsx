'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()

  // Hide Navbar on login page
  if (pathname === '/login') {
    return null
  }

  return (
    <nav className="w-full bg-faesa-blue text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/onboarding" className="font-bold text-xl tracking-tight flex items-center gap-2">
              <span className="bg-white text-faesa-blue p-1 rounded">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              ConnectFAESA
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full hover:bg-white/10 transition">
              <User size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 transition text-red-300 hover:text-red-400">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
