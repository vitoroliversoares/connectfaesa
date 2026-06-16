'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { updatePasswordAction } from '@/actions/auth'

export default function ResetPasswordClient() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('Senha muito curta', {
        description: 'A senha deve ter no mínimo 6 caracteres.',
      })
      return
    }

    if (password !== confirmPassword) {
      toast.error('Senhas não coincidem', {
        description: 'A nova senha e a confirmação devem ser idênticas.',
      })
      return
    }

    setIsLoading(true)
    const { error } = await updatePasswordAction(password)
    setIsLoading(false)

    if (error) {
      toast.error('Erro ao atualizar senha', {
        description: error,
      })
    } else {
      toast.success('Senha atualizada com sucesso!', {
        description: 'Sua senha foi redefinida. Você será redirecionado para a plataforma.',
      })
      // Redireciona para a raiz para validar se precisa de onboarding ou vai direto ao dashboard
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen bg-faesa-blue flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden mx-4"
      >
        {/* Barra superior com gradiente */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-faesa-light"></div>
        
        <div className="text-center mb-8 mt-4">
          <div className="flex justify-center mb-6">
            <Image src="/logo.png" alt="Logo FAESA" width={240} height={60} priority className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Definir Nova Senha</h1>
          <p className="text-gray-500 text-sm mt-2 leading-relaxed">
            Digite e confirme sua nova senha de acesso abaixo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-faesa-blue focus:border-faesa-blue outline-none transition-all text-gray-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="confirmPassword"
                type="password"
                required
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-faesa-blue focus:border-faesa-blue outline-none transition-all text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password || !confirmPassword}
            className="w-full flex items-center justify-center gap-3 bg-faesa-blue text-white hover:bg-faesa-light transition-colors py-3 px-4 rounded-xl font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-faesa-blue disabled:opacity-50 mt-6 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Redefinir Senha'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
