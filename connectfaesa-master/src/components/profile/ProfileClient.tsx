'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { ArrowLeft, Edit2, LogOut, KeyRound, User, BookOpen, Clock, X, Phone } from 'lucide-react'
import EditProfileModal from './EditProfileModal'
import Link from 'next/link'
import { logoutAction, updatePasswordAction } from '@/actions/auth'

export default function ProfileClient({ initialProfile, userEmail }: { initialProfile: any, userEmail: string }) {
  const [profile, setProfile] = useState(initialProfile)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const handleLogout = async () => {
    await logoutAction()
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    
    setIsSavingPassword(true)
    const { error } = await updatePasswordAction(newPassword)

    if (error) {
      toast.error('Erro ao atualizar senha', { description: error })
    } else {
      toast.success('Senha atualizada com sucesso!')
      setIsPasswordModalOpen(false)
      setNewPassword('')
    }
    setIsSavingPassword(false)
  }

  const handleProfileUpdated = (updatedProfile: any) => {
    setProfile(updatedProfile)
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 transition-colors duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-faesa-blue dark:text-zinc-400 dark:hover:text-white transition-colors font-medium">
          <ArrowLeft size={20} className="mr-2" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
        <div className="w-20" /> {/* Spacer para centralizar o título se necessário */}
      </div>

      {/* Resumo do Perfil (Header Card) */}
      <div className="bg-white dark:bg-zinc-900/60 rounded-3xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-faesa-light to-faesa-blue"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mt-2">
          <div className="w-24 h-24 bg-faesa-accent dark:bg-zinc-800 rounded-full flex items-center justify-center text-faesa-blue dark:text-blue-400 flex-shrink-0 border border-black/[0.02] dark:border-white/[0.02]">
            <User size={48} />
          </div>
          <div className="text-center sm:text-left flex-grow">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h2>
            <p className="text-gray-500 dark:text-zinc-400 mt-1">{userEmail}</p>
            <div className="mt-4 inline-block px-4 py-2 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded-full font-medium text-sm border border-blue-100 dark:border-blue-900/40">
              {profile.course} • {profile.shift}
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 bg-faesa-blue dark:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-faesa-light dark:hover:bg-blue-500 transition-colors shadow-sm cursor-pointer"
          >
            <Edit2 size={18} />
            Editar
          </motion.button>
        </div>
      </div>

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
          <h3 className="text-sm font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <BookOpen size={16} /> Objetivo Atual
          </h3>
          <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">{profile.main_goal}</p>
          {profile.specific_goal && (
            <p className="text-gray-600 dark:text-zinc-400 text-sm italic">"{profile.specific_goal}"</p>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
          <h3 className="text-sm font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Phone size={16} /> Contato e Disponibilidade
          </h3>
          <p className="text-gray-900 dark:text-zinc-100 font-medium mb-1 font-bold">WhatsApp: <span className="font-normal text-gray-650 dark:text-zinc-400">{profile.whatsapp}</span></p>
          <p className="text-gray-900 dark:text-zinc-100 font-medium font-bold">Tempo Livre: <span className="font-normal text-gray-650 dark:text-zinc-400">{profile.availability_hours} horas/sem</span></p>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
          <h3 className="text-sm font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4">Minhas Habilidades (Ofereço)</h3>
          <div className="space-y-3">
            {profile.top_skills?.map((skill: string) => (
              <div key={skill} className="bg-gray-50 dark:bg-zinc-950/20 rounded-xl p-3 border border-gray-100 dark:border-zinc-800">
                <p className="font-medium text-gray-800 dark:text-zinc-200 text-sm">{skill}</p>
                {profile.specific_skills && profile.specific_skills[skill] && (
                  <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">↳ {profile.specific_skills[skill]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/60 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
          <h3 className="text-sm font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-4">O que procuro (Busco)</h3>
          <div className="flex flex-wrap gap-2">
            {profile.partner_needs?.map((skill: string) => (
              <span key={skill} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40 rounded-lg text-sm font-medium">
                {skill.split('/')[0].trim()}
              </span>
            ))}
          </div>
          {profile.feedback && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-850">
              <h4 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase mb-2">Meu Feedback/Sobre</h4>
              <p className="text-sm text-gray-600 dark:text-zinc-400">{profile.feedback}</p>
            </div>
          )}
        </div>

      </div>

      {/* Ações de Segurança e Conta */}
      <div className="bg-white dark:bg-zinc-900/60 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 flex flex-col sm:flex-row gap-4">
        <motion.button 
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={() => setIsPasswordModalOpen(true)}
          className="flex-grow flex-1 flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-medium py-3 px-4 rounded-xl transition-colors border border-gray-200 dark:border-zinc-700 cursor-pointer"
        >
          <KeyRound size={20} />
          Alterar Senha
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={handleLogout}
          className="flex-grow flex-1 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-medium py-3 px-4 rounded-xl transition-colors border border-red-100 dark:border-red-900/40 cursor-pointer"
        >
          <LogOut size={20} />
          Sair da Conta
        </motion.button>
      </div>

      {/* Modal de Senha */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-gray-100 dark:border-zinc-800"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Nova Senha</h3>
                  <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-400 cursor-pointer">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleUpdatePassword}>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha..."
                    className="w-full p-4 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-faesa-blue outline-none text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 mb-4"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={isSavingPassword || !newPassword}
                    className="w-full bg-faesa-blue dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-3 rounded-xl font-medium disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingPassword ? 'Salvando...' : 'Atualizar Senha'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Edição */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditProfileModal 
            profile={profile} 
            onClose={() => setIsEditModalOpen(false)} 
            onSave={handleProfileUpdated}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
