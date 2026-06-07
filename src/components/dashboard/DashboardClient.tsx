'use client'

import { useState, useMemo } from 'react'
import { Filter, X } from 'lucide-react'
import ProfileCard from './ProfileCard'
import ProfileModal from './ProfileModal'
import { motion, AnimatePresence } from 'framer-motion'
import { SKILL_OPTIONS } from '@/lib/validations/onboarding'

// Constantes para filtros
const GOALS = ['TCC', 'Startup', 'Grupo de Estudos', 'Extracurricular', 'Outros']
const COURSES = [
  'Administração', 'Arquitetura e Urbanismo', 'Ciências Contábeis', 'Design Gráfico', 
  'Enfermagem', 'Engenharia da Computação', 'Engenharia Elétrica', 'Jornalismo', 
  'Odontologia', 'Psicologia', 'Sistemas de Informação', 
  'Análise e Desenvolvimento de Sistemas (ADS)', 'Ciência da Computação', 'Design de Moda'
]

export default function DashboardClient({ currentUser, initialProfiles }: { currentUser: any, initialProfiles: any[] }) {
  const [profiles, setProfiles] = useState<any[]>(initialProfiles)
  const [loading, setLoading] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null)

  // Filters State
  const [showFilters, setShowFilters] = useState(false)
  const [courseFilter, setCourseFilter] = useState('')
  const [goalFilter, setGoalFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')

  const filteredAndSortedProfiles = useMemo(() => {
    let result = profiles

    // Filtros
    if (courseFilter) result = result.filter(p => p.course === courseFilter)
    if (goalFilter) result = result.filter(p => p.main_goal === goalFilter)
    if (skillFilter) result = result.filter(p => p.top_skills?.includes(skillFilter))

    // Match Algorítmico (Ordenação Client-side)
    result.sort((a, b) => {
      const aMatches = a.top_skills?.filter((s: string) => currentUser.partner_needs?.includes(s)).length || 0
      const bMatches = b.top_skills?.filter((s: string) => currentUser.partner_needs?.includes(s)).length || 0
      return bMatches - aMatches 
    })

    return result
  }, [profiles, courseFilter, goalFilter, skillFilter, currentUser.partner_needs])

  return (
    <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8 relative">
      
      {/* Botão de Filtro Mobile */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Alunos</h1>
        <button 
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-xl text-gray-700 font-medium"
        >
          <Filter size={18} /> Filtros
        </button>
      </div>

      {/* Sidebar de Filtros (Desktop) */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Filter size={20} /> Filtros
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo</label>
              <select 
                value={goalFilter} 
                onChange={e => setGoalFilter(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-faesa-blue outline-none text-slate-900"
              >
                <option className="text-slate-900 bg-white" value="">Todos</option>
                {GOALS.map(g => <option className="text-slate-900 bg-white" key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Habilidade Oferecida</label>
              <select 
                value={skillFilter} 
                onChange={e => setSkillFilter(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-faesa-blue outline-none text-slate-900"
              >
                <option className="text-slate-900 bg-white" value="">Todas</option>
                {SKILL_OPTIONS.map(s => <option className="text-slate-900 bg-white" key={s} value={s}>{s.split('/')[0].trim()}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
              <select 
                value={courseFilter} 
                onChange={e => setCourseFilter(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-faesa-blue outline-none text-slate-900"
              >
                <option className="text-slate-900 bg-white" value="">Todos</option>
                {COURSES.map(c => <option className="text-slate-900 bg-white" key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* Drawer de Filtros (Mobile) */}
      <AnimatePresence>
        {showFilters && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full bg-white rounded-t-3xl p-6 shadow-xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo</label>
                  <select value={goalFilter} onChange={e => setGoalFilter(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none text-slate-900">
                    <option className="text-slate-900 bg-white" value="">Todos</option>
                    {GOALS.map(g => <option className="text-slate-900 bg-white" key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Habilidade Oferecida</label>
                  <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none text-slate-900">
                    <option className="text-slate-900 bg-white" value="">Todas</option>
                    {SKILL_OPTIONS.map(s => <option className="text-slate-900 bg-white" key={s} value={s}>{s.split('/')[0].trim()}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
                  <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-xl outline-none text-slate-900">
                    <option className="text-slate-900 bg-white" value="">Todos</option>
                    {COURSES.map(c => <option className="text-slate-900 bg-white" key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-faesa-blue text-white py-4 rounded-xl font-bold mt-4"
                >
                  Aplicar Filtros
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grid de Perfis */}
      <main className="flex-grow">
        <h1 className="hidden md:block text-3xl font-bold text-gray-900 mb-6">Feed de Alunos</h1>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl h-64 border border-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : filteredAndSortedProfiles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum aluno encontrado</h3>
            <p className="text-gray-500">Tente ajustar seus filtros para ver mais resultados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAndSortedProfiles.map(profile => (
              <ProfileCard 
                key={profile.id} 
                profile={profile} 
                onOpen={() => setSelectedProfile(profile)} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {selectedProfile && (
          <ProfileModal 
            profile={selectedProfile} 
            onClose={() => setSelectedProfile(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  )
}
