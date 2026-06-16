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
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 flex flex-col h-full hover:shadow-md transition-shadow relative overflow-hidden">
      
      {/* Indicador de Status de Conexão no topo */}
      {connectionState && (
        <div className="absolute top-0 right-0 left-0 h-1 bg-transparent">
          {connectionState.status === 'accepted' && <div className="h-full bg-green-500 w-full" />}
          {connectionState.status === 'pending' && <div className="h-full bg-blue-400 w-full animate-pulse" />}
        </div>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-faesa-accent rounded-full flex items-center justify-center flex-shrink-0 text-faesa-blue font-bold">
          {profile.full_name ? profile.full_name[0] : <User size={24} />}
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base line-clamp-1">{profile.full_name}</h3>
          </div>
          <p className="text-xs text-gray-500 line-clamp-1">{profile.course} • {profile.shift}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(profile.main_goal)}`}>
          {profile.main_goal}
        </span>

        {profile.matchScore !== undefined && (
          <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-extrabold border border-amber-200" title="Score de Compatibilidade">
            <Star size={12} className="fill-amber-500 text-amber-500" />
            {profile.matchScore}% Match
          </div>
        )}
      </div>

      <div className="flex-grow">
        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Oferece:</h4>
        <div className="flex flex-wrap gap-1.5">
          {profile.top_skills?.map((skill: string) => (
            <span key={skill} className="px-2 py-0.5 bg-gray-50 border border-gray-150 rounded-md text-xs text-gray-700 font-medium">
              {skill.split('/')[0].trim()}
            </span>
          ))}
        </div>
      </div>

      {/* Exibir Status Text se Conectado ou Pendente */}
      <div className="mt-5 flex items-center justify-between gap-2">
        {connectionState ? (
          connectionState.status === 'accepted' ? (
            <span className="text-xs bg-green-50 text-green-700 font-bold px-2 py-1 rounded-lg border border-green-200 flex items-center gap-1">
              <Check size={14} /> Conectado
            </span>
          ) : (
            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
              <Clock size={14} className="animate-spin-slow" /> Pendente
            </span>
          )
        ) : (
          <div />
        )}

        <button 
          onClick={onOpen}
          className="py-2 px-4 bg-gray-50 hover:bg-gray-100 text-faesa-blue font-bold rounded-xl transition-colors border border-gray-200 text-xs shadow-sm cursor-pointer ml-auto"
        >
          Ver Perfil
        </button>
      </div>
    </div>
  )
}

