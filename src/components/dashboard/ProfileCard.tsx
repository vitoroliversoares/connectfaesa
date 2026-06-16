import { User, Star, Check, Clock } from 'lucide-react'

export default function ProfileCard({ profile, onOpen }: { profile: any, onOpen: () => void }) {
  // Goal Badge Colors
  const getBadgeColor = (goal: string) => {
    switch (goal) {
      case 'TCC': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Startup': return 'bg-green-100 text-green-800 border-green-200'
      case 'Grupo de Estudos': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Extracurricular': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const connectionState = profile.connectionState

  return (
    <div className="bg-white rounded-[2rem] border border-black/[0.04] p-7 flex flex-col h-full hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.05)] transition-all duration-500 ease-out relative overflow-hidden bg-gradient-to-b from-white to-gray-50/10">
      
      {/* Indicador de Status de Conexão no topo */}
      {connectionState && (
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-transparent">
          {connectionState.status === 'accepted' && <div className="h-full bg-green-500 w-full" />}
          {connectionState.status === 'pending' && <div className="h-full bg-blue-400 w-full animate-pulse" />}
        </div>
      )}

      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 bg-faesa-accent rounded-2xl flex items-center justify-center flex-shrink-0 text-faesa-blue font-bold text-lg border border-black/[0.02]">
          {profile.full_name ? profile.full_name[0] : <User size={24} />}
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[#1D1D1F] text-base line-clamp-1 leading-snug">{profile.full_name}</h3>
          </div>
          <p className="text-xs text-gray-500 line-clamp-1">{profile.course} • {profile.shift}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-2 mb-5">
        <span className={`inline-block px-3 py-1 rounded-xl text-[11px] font-bold border ${getBadgeColor(profile.main_goal)}`}>
          {profile.main_goal}
        </span>

        {profile.matchScore !== undefined && (
          <div className="flex items-center gap-1 bg-amber-500/[0.08] text-amber-800 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/10" title="Score de Compatibilidade">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            {profile.matchScore}% Match
          </div>
        )}
      </div>

      <div className="flex-grow">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Oferece:</h4>
        <div className="flex flex-wrap gap-1.5">
          {profile.top_skills?.map((skill: string) => (
            <span key={skill} className="px-2.5 py-1 bg-[#F5F5F7] border border-black/[0.03] rounded-lg text-xs text-gray-700 font-semibold transition hover:bg-gray-200/50">
              {skill.split('/')[0].trim()}
            </span>
          ))}
        </div>
      </div>

      {/* Exibir Status Text se Conectado ou Pendente */}
      <div className="mt-6 flex items-center justify-between gap-2 pt-4 border-t border-black/[0.02]">
        {connectionState ? (
          connectionState.status === 'accepted' ? (
            <span className="text-xs bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-xl border border-green-200 flex items-center gap-1">
              <Check size={14} /> Conectado
            </span>
          ) : (
            <span className="text-xs bg-blue-50/50 text-blue-700 font-semibold px-2.5 py-1 rounded-xl border border-blue-200/60 flex items-center gap-1">
              <Clock size={14} className="animate-spin-slow" /> Pendente
            </span>
          )
        ) : (
          <div />
        )}

        <button 
          onClick={onOpen}
          className="py-2.5 px-4.5 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] font-bold rounded-2xl transition-all border border-black/[0.03] text-xs shadow-sm cursor-pointer ml-auto hover:scale-[1.03]"
        >
          Ver Perfil
        </button>
      </div>
    </div>
  )
}

