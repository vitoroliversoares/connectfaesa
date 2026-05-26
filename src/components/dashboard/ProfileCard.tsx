import { User } from 'lucide-react'

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-faesa-accent rounded-full flex items-center justify-center flex-shrink-0 text-faesa-blue">
          <User size={24} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{profile.full_name}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">{profile.course} • {profile.shift}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(profile.main_goal)}`}>
          {profile.main_goal}
        </span>
      </div>

      <div className="flex-grow">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Oferece:</h4>
        <div className="flex flex-wrap gap-2">
          {profile.top_skills?.map((skill: string) => (
            <span key={skill} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
              {skill.split('/')[0].trim()}
            </span>
          ))}
        </div>
      </div>

      <button 
        onClick={onOpen}
        className="mt-6 w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-faesa-blue font-medium rounded-xl transition-colors border border-gray-200"
      >
        Ver Perfil
      </button>
    </div>
  )
}
