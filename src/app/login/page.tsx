'use client'

import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'invalid_domain') {
      toast.error('Acesso negado', {
        description: 'A plataforma ConnectFAESA é exclusiva para alunos. Utilize seu e-mail @aluno.faesa.br ou @faesa.br',
        duration: 8000,
      })
    } else if (error) {
      toast.error('Erro na autenticação. Link expirado ou inválido.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação estrita de domínio no Frontend
    if (!email.endsWith('@aluno.faesa.br') && !email.endsWith('@faesa.br')) {
      toast.error('E-mail inválido', {
        description: 'Utilize o seu e-mail institucional da FAESA.',
      })
      return
    }

    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    setIsLoading(false)

    if (error) {
      toast.error('Erro ao enviar link mágico: ' + error.message)
    } else {
      setIsSuccess(true)
      toast.success('Link enviado!', {
        description: 'Verifique sua caixa de entrada para fazer login.',
      })
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden mx-4"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-faesa-light"></div>
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-faesa-blue text-white rounded-xl flex justify-center items-center mb-4 transform rotate-45 shadow-lg">
          <svg className="w-8 h-8 -rotate-45" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 12L12 22L22 12L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="8" y="8" width="8" height="8" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">ConnectFAESA</h1>
        <p className="text-gray-500 text-center mt-2">
          Entre com seu e-mail institucional.
        </p>
      </div>

      {isSuccess ? (
        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
          <div className="flex justify-center mb-2 text-green-500">
            <Mail size={32} />
          </div>
          <h3 className="text-green-800 font-semibold">Verifique seu E-mail</h3>
          <p className="text-green-600 text-sm mt-1">Enviamos um link mágico para você acessar a plataforma.</p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail Institucional
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="seu.nome@aluno.faesa.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-faesa-blue focus:border-faesa-blue outline-none transition-all text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex items-center justify-center gap-3 bg-faesa-blue text-white hover:bg-faesa-light transition-colors py-3 px-4 rounded-xl font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-faesa-blue disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Receber Link Mágico'
            )}
          </button>
        </form>
      )}

      <p className="text-xs text-center text-gray-400 mt-6">
        Acesso restrito a e-mails @aluno.faesa.br ou @faesa.br.
      </p>
    </motion.div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-faesa-blue flex flex-col justify-center items-center">
      <Suspense fallback={<div className="text-white">Carregando...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  )
}
