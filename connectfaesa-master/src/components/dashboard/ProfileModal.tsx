import { motion } from 'framer-motion'
import { X, MessageCircle, Clock, BookOpen, User, Check, Trash2, Star } from 'lucide-react'
import { calculateMatchScore } from '@/lib/match'

export default function ProfileModal({ 
  profile, 
  currentUser,
  onClose,
  onConnect,
  onAccept,
  onDecline,
  onCancel
}: { 
  profile: any, 
  currentUser: any,
  onClose: () => void,
  onConnect?: (id: string) => void,
  onAccept?: (connId: string) => void,
  onDecline?: (connId: string) => void,
  onCancel?: (connId: string) => void
}) {
  if (!profile) return null

  const connectionState = profile.connectionState
  const match = calculateMatchScore(currentUser, profile)

  const handleWhatsApp = () => {
    if (!profile.whatsapp) return
    const rawNumber = profile.whatsapp || ''
    const cleanNumber = rawNumber.replace(/\D/g, '')
    
    const message = `Olá ${profile.full_name.split(' ')[0]}! Vi seu perfil no ConnectFAESA e notei que você busca parceiros para ${profile.main_goal}. Vamos conversar?`
    const encodedMessage = encodeURIComponent(message)
    
    window.open(`https://wa.me/55${cleanNumber}?text=${encodedMessage}`, '_blank')
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      {/* Backdrop de fechamento */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full sm:max-w-lg bg-white dark:bg-zinc-900 sm:rounded-2xl rounded-t-3xl shadow-xl overflow-hidden relative max-h-[90vh] flex flex-col border border-gray-100 dark:border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de arrastar no mobile */}
        <div className="w-full flex justify-center py-3 sm:hidden bg-white dark:bg-zinc-900 border-b border-gray-50 dark:border-zinc-850 flex-shrink-0">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full" />
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-zinc-800 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors hidden sm:block z-10 cursor-pointer">
          <X size={20} className="text-gray-600 dark:text-zinc-300" />
        </button>

        <div className="p-6 overflow-y-auto flex-grow">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-faesa-accent dark:bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0 text-faesa-blue dark:text-blue-400 font-bold text-xl border border-black/[0.02] dark:border-white/[0.02]">
              {profile.full_name ? profile.full_name[0] : <User size={32} />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h2>
              <p className="text-gray-500 dark:text-zinc-400 text-sm">{profile.course} • {profile.shift}</p>
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                <BookOpen size={16} /> Objetivo Principal
              </h3>
              <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 px-4 py-3 rounded-xl inline-block font-medium border border-blue-100 dark:border-blue-900/40">
                {profile.main_goal}
              </div>
              {profile.specific_goal && (
                <p className="mt-2 text-gray-700 dark:text-zinc-300 bg-gray-50 dark:bg-zinc-950/20 p-3 rounded-lg border border-gray-100 dark:border-zinc-800 text-sm italic">
                  "{profile.specific_goal}"
                </p>
              )}
            </section>

            {/* Motivos da Porcentagem de Match (Explicação Acadêmica) */}
            {match && (
              <section className="bg-amber-50/60 dark:bg-amber-950/15 p-4 rounded-xl border border-amber-100 dark:border-amber-900/20">
                <h3 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  {match.score}% de Compatibilidade
                </h3>
                <ul className="text-xs text-amber-900 dark:text-amber-300/90 space-y-1.5 list-disc pl-4 leading-relaxed font-medium">
                  {match.reasons.map((reason: string, idx: number) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Informações de Contato baseadas na Conexão */}
            {(!connectionState || connectionState.status !== 'accepted') && (
              <section className="bg-gray-50 dark:bg-zinc-950/20 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                <h3 className="text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  🔒 Informações de Contato Ocultas
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-500 leading-relaxed">
                  Para sua privacidade e segurança, dados de contato ficam visíveis apenas para conexões aceitas (matches mútuos). Envie uma solicitação abaixo para se conectar!
                </p>
              </section>
            )}

            <section>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">O que oferece</h3>
              <div className="space-y-3">
                {profile.top_skills?.map((skill: string) => (
                  <div key={skill} className="bg-gray-50 dark:bg-zinc-950/20 border border-gray-200 dark:border-zinc-800 rounded-xl p-3">
                    <p className="font-medium text-gray-800 dark:text-zinc-200">{skill}</p>
                    {profile.specific_skills && profile.specific_skills[skill] && (
                      <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
                        ↳ {profile.specific_skills[skill]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock size={16} /> Disponibilidade
              </h3>
              <p className="text-gray-800 dark:text-zinc-200 font-medium">{profile.availability_hours} horas por semana</p>
            </section>
            
            {profile.feedback && (
              <section>
                 <h3 className="text-sm font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Sobre</h3>
                 <p className="text-gray-700 dark:text-zinc-300 text-sm whitespace-pre-wrap">{profile.feedback}</p>
              </section>
            )}
          </div>
        </div>

        {/* Rodapé de Ações Dinâmicas */}
        <div className="p-4 sm:p-6 bg-gray-50 dark:bg-zinc-950/40 border-t border-gray-100 dark:border-zinc-850 flex-shrink-0">
          {!connectionState ? (
            <motion.button 
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onConnect?.(profile.id)}
              className="w-full flex items-center justify-center gap-2 bg-faesa-blue hover:bg-faesa-light dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Solicitar Conexão
            </motion.button>
          ) : connectionState.status === 'accepted' ? (
            <div className="space-y-3">
              <motion.button 
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={handleWhatsApp}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
              >
                <MessageCircle size={22} />
                Chamar no WhatsApp
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onCancel?.(connectionState.id)}
                className="w-full flex items-center justify-center gap-1.5 bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 font-semibold py-2.5 rounded-xl transition text-xs cursor-pointer"
              >
                <Trash2 size={14} /> Desfazer Conexão
              </motion.button>
            </div>
          ) : connectionState.status === 'pending' ? (
            connectionState.isSender ? (
              <div className="space-y-3">
                <button 
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-950/20 text-blue-500 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 font-bold py-4 px-6 rounded-xl cursor-not-allowed"
                >
                  <Clock size={20} className="animate-spin-slow" /> Solicitação Pendente
                </button>
                <motion.button 
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => onCancel?.(connectionState.id)}
                  className="w-full flex items-center justify-center bg-white dark:bg-zinc-900 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 font-semibold py-2.5 rounded-xl transition text-xs cursor-pointer"
                >
                  Cancelar Solicitação
                </motion.button>
              </div>
            ) : (
              <div className="flex gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAccept?.(connectionState.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-xl transition shadow-sm cursor-pointer text-sm"
                >
                  <Check size={18} /> Aceitar
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDecline?.(connectionState.id)}
                  className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-900 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-300 dark:border-zinc-700 font-bold py-4 px-4 rounded-xl transition cursor-pointer text-sm"
                >
                  Recusar
                </motion.button>
              </div>
            )
          ) : (
            /* Se estiver recusado, permite reenviar */
            <motion.button 
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onConnect?.(profile.id)}
              className="w-full flex items-center justify-center gap-2 bg-faesa-blue hover:bg-faesa-light dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Solicitar Conexão novamente
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
