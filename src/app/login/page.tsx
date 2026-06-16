'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Lock, Mail, ArrowLeft } from 'lucide-react'
import { loginAction, registerAction, resetPasswordAction } from '@/actions/auth'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'invalid_domain') {
      toast.error('Acesso negado', {
        description: 'A plataforma ConnectFAESA é exclusiva para alunos. Utilize seu e-mail @aluno.faesa.br ou @faesa.br',
        duration: 8000,
      })
    } else if (error) {
      toast.error('Erro na autenticação. Tente novamente.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação estrita de domínio no Frontend
    if (!email.endsWith('@aluno.faesa.br') && !email.endsWith('@faesa.br')) {
      toast.error('E-mail inválido', {
        description: 'Utilize o seu e-mail institucional da FAESA.',
      })
      return
    }

    // Se estiver redefinindo a senha, só precisamos do e-mail
    if (isResetting) {
      setIsLoading(true)
      const res = await resetPasswordAction(email)
      setIsLoading(false)
      
      if (res.error) {
        toast.error('Erro ao solicitar redefinição: ' + res.error)
      } else {
        toast.success('Link enviado com sucesso!', {
          description: 'Enviamos as instruções de alteração de senha para o seu e-mail institucional.',
          duration: 8000,
        })
        setIsResetting(false)
      }
      return
    }

    if (password.length < 6) {
      toast.error('Senha muito curta', {
        description: 'A senha deve ter no mínimo 6 caracteres.',
      })
      return
    }

    setIsLoading(true)

    if (isRegistering) {
      // Fluxo de Cadastro via Server Action com verificação de e-mail
      const { error } = await registerAction(email, password)

      if (error) {
        toast.error('Erro ao cadastrar: ' + error)
        setIsLoading(false)
      } else {
        toast.success('Cadastro solicitado com sucesso!', {
          description: 'Enviamos um link de confirmação para o seu e-mail. Por favor, ative a conta na caixa de entrada antes de fazer o login.',
          duration: 10000,
        })
        setIsRegistering(false)
        setPassword('')
        setIsLoading(false)
      }
    } else {
      // Fluxo de Login via Server Action
      const result = await loginAction(email, password)

      if (result.error) {
        toast.error('Erro ao acessar', {
          description: result.error.includes('Email not confirmed') 
            ? 'Por favor, confirme seu e-mail institucional clicando no link de ativação enviado para sua caixa de entrada.' 
            : result.error === 'Invalid login credentials' 
              ? 'E-mail ou senha incorretos.' 
              : result.error
        })
        setIsLoading(false)
      } else {
        toast.success('Login bem-sucedido!')
        if (result.hasProfile) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      }
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
      
      {isResetting && (
        <button 
          onClick={() => setIsResetting(false)}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
      )}
      
      <div className="text-center mb-8 mt-4">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Logo FAESA" width={240} height={60} priority className="h-12 w-auto" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isResetting ? 'Recuperar Senha' : isRegistering ? 'Criar Conta' : 'Entrar na Plataforma'}
        </h1>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed">
          {isResetting 
            ? 'Insira seu e-mail institucional para receber o link de redefinição de senha.' 
            : isRegistering 
              ? 'Crie sua conta institucional para começar.' 
              : 'Acesse sua conta para continuar.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail Institucional
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              id="email"
              type="email"
              required
              placeholder="seu.nome@aluno.faesa.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-faesa-blue focus:border-faesa-blue outline-none transition-all text-gray-900"
            />
          </div>
        </div>

        {!isResetting && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={() => setIsResetting(true)}
                  className="text-xs text-faesa-blue hover:text-faesa-light font-semibold cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-faesa-blue focus:border-faesa-blue outline-none transition-all text-gray-900"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email || (!isResetting && !password)}
          className="w-full flex items-center justify-center gap-3 bg-faesa-blue text-white hover:bg-faesa-light transition-colors py-3 px-4 rounded-xl font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-faesa-blue disabled:opacity-50 mt-4 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            isResetting 
              ? 'Enviar Link de Recuperação' 
              : isRegistering 
                ? 'Criar Conta' 
                : 'Entrar'
          )}
        </button>
      </form>

      {!isResetting && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm text-faesa-blue hover:text-faesa-light font-medium transition-colors cursor-pointer"
          >
            {isRegistering 
              ? 'Já tem uma conta? Faça login' 
              : 'Primeiro acesso? Cadastre-se'}
          </button>
        </div>
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
