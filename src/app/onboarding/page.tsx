'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function OnboardingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [supabase, router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Bem-vindo(a) ao ConnectFAESA!</h1>
        <p className="text-gray-600 text-lg mb-8">
          Você logou com sucesso usando a conta: <span className="font-semibold text-faesa-blue">{user?.email}</span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { title: 'Encontre um Parceiro de TCC', desc: 'Filtre por curso e interesses para achar o par ideal.', icon: '🎓' },
            { title: 'Forme Grupos de Estudo', desc: 'Junte-se a colegas para mandar bem nas disciplinas.', icon: '📚' },
            { title: 'Startup Co-founders', desc: 'Tem uma ideia? Encontre alunos de TI, Negócios e Design.', icon: '🚀' },
          ].map((item, i) => (
            <div key={i} className="p-6 bg-faesa-accent rounded-xl border border-blue-50 hover:shadow-md transition">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-semibold text-xl text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
