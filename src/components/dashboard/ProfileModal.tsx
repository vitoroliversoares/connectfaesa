import { motion } from 'framer-motion'
import { X, MessageCircle, Clock, BookOpen, User } from 'lucide-react'

export default function ProfileModal({ profile, onClose }: { profile: any, onClose: () => void }) {
  if (!profile) return null

  const handleWhatsApp = () => {
    const rawNumber = profile.whatsapp || ''
    const cleanNumber = rawNumber.replace(/\D/g, '')
    
    const message = `Olá ${profile.full_name.split(' ')[0]}! Vi seu perfil no ConnectFAESA e notei que você busca parceiros para ${profile.main_goal}. Vamos conversar?`
    const encodedMessage = encodeURIComponent(message)
    
    window.open(`https://wa.me/55${cleanNumber}?text=${encodedMessage}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      {/* Backdrop de fechamento */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full sm:max-w-lg bg-white sm:rounded-2xl rounded-t-3xl shadow-xl overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de arrastar no mobile */}
        <div className="w-full flex justify-center py-3 sm:hidden">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors hidden sm:block">
          <X size={20} className="text-gray-600" />
        </button>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-faesa-accent rounded-full flex items-center justify-center flex-shrink-0 text-faesa-blue">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
              <p className="text-gray-500">{profile.course} • {profile.shift}</p>
            </div>
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <BookOpen size={16} /> Objetivo Principal
              </h3>
              <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl inline-block font-medium border border-blue-100">
                {profile.main_goal}
              </div>
              {profile.specific_goal && (
                <p className="mt-2 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm italic">
                  "{profile.specific_goal}"
                </p>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">O que oferece</h3>
              <div className="space-y-3">
                {profile.top_skills?.map((skill: string) => (
                  <div key={skill} className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                    <p className="font-medium text-gray-800">{skill}</p>
                    {profile.specific_skills && profile.specific_skills[skill] && (
                      <p className="text-sm text-gray-600 mt-1">
                        ↳ {profile.specific_skills[skill]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock size={16} /> Disponibilidade
              </h3>
              <p className="text-gray-800 font-medium">{profile.availability_hours} horas por semana</p>
            </section>
            
            {profile.feedback && (
              <section>
                 <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Sobre</h3>
                 <p className="text-gray-700 text-sm whitespace-pre-wrap">{profile.feedback}</p>
              </section>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-sm"
          >
            <MessageCircle size={24} />
            Chamar no WhatsApp
          </button>
        </div>
      </motion.div>
    </div>
  )
}
