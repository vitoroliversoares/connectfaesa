'use client'

import { useState, useMemo, useEffect } from 'react'
import { Filter, X, Users, UserCheck, MessageSquare, Check, Search, ArrowRight, Clock, Star } from 'lucide-react'
import ProfileCard from './ProfileCard'
import ProfileModal from './ProfileModal'
import ProfileCardSkeleton from './ProfileCardSkeleton'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import { SKILL_OPTIONS } from '@/lib/validations/onboarding'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  sendConnectionRequestAction, 
  acceptConnectionRequestAction, 
  declineConnectionRequestAction, 
  cancelConnectionRequestAction 
} from '@/actions/connection'
import { createClient } from '@/lib/supabase/client'
import { calculateMatchScore } from '@/lib/match'

// Constantes para filtros
const GOALS = ['TCC', 'Startup', 'Grupo de Estudos', 'Extracurricular', 'Outros']
const SHIFTS = ['Matutino', 'Vespertino', 'Noturno']
const COURSES = [
  'Administração', 'Arquitetura e Urbanismo', 'Ciências Contábeis', 'Design Gráfico', 
  'Enfermagem', 'Engenharia da Computação', 'Engenharia Elétrica', 'Jornalismo', 
  'Odontologia', 'Psicologia', 'Sistemas de Informação', 
  'Análise e Desenvolvimento de Sistemas (ADS)', 'Ciência da Computação', 'Design de Moda'
]

export default function DashboardClient({ 
  currentUser, 
  initialProfiles,
  initialConnections 
}: { 
  currentUser: any, 
  initialProfiles: any[],
  initialConnections: any[] 
}) {
  const [profiles, setProfiles] = useState<any[]>(initialProfiles)
  const [loading, setLoading] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'feed' | 'connections'>('feed')

  // Search e Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [courseFilter, setCourseFilter] = useState('')
  const [goalFilter, setGoalFilter] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [shiftFilter, setShiftFilter] = useState('')

  const router = useRouter()

  // Opções formatadas para o CustomSelect (Desktop)
  const goalOptions = useMemo(() => [
    { value: '', label: 'Todos os Objetivos' },
    ...GOALS.map(g => ({ value: g, label: g }))
  ], [])

  const skillOptions = useMemo(() => [
    { value: '', label: 'Todas as Habilidades' },
    ...SKILL_OPTIONS.map(s => ({ value: s, label: s.split('/')[0].trim() }))
  ], [])

  const shiftOptions = useMemo(() => [
    { value: '', label: 'Todos os Turnos' },
    ...SHIFTS.map(s => ({ value: s, label: s }))
  ], [])

  const courseOptions = useMemo(() => [
    { value: '', label: 'Todos os Cursos' },
    ...COURSES.map(c => ({ value: c, label: c }))
  ], [])

  // Opções formatadas para o CustomSelect (Mobile)
  const goalOptionsMobile = useMemo(() => [
    { value: '', label: 'Todos' },
    ...GOALS.map(g => ({ value: g, label: g }))
  ], [])

  const skillOptionsMobile = useMemo(() => [
    { value: '', label: 'Todas' },
    ...SKILL_OPTIONS.map(s => ({ value: s, label: s.split('/')[0].trim() }))
  ], [])

  const shiftOptionsMobile = useMemo(() => [
    { value: '', label: 'Todos' },
    ...SHIFTS.map(s => ({ value: s, label: s }))
  ], [])

  const courseOptionsMobile = useMemo(() => [
    { value: '', label: 'Todos' },
    ...COURSES.map(c => ({ value: c, label: c }))
  ], [])

  // Sincronizar dados quando o servidor recarregar
  useEffect(() => {
    setProfiles(initialProfiles)
    
    // Se o modal de detalhes estiver aberto, atualiza os dados dele também para revelar os contatos imediatamente
    if (selectedProfile) {
      const updatedSelected = initialProfiles.find(p => p.id === selectedProfile.id)
      if (updatedSelected) {
        setSelectedProfile(updatedSelected)
      }
    }
  }, [initialProfiles, selectedProfile])

  // Configurar Listener do Supabase Realtime para conexões em tempo real absoluto
  useEffect(() => {
    const supabase = createClient()
    
    const channel = supabase
      .channel('realtime-connections-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections'
        },
        (payload) => {
          console.log('Detectado alteração de conexão em tempo real:', payload)
          // Força o Next.js a re-executar as queries no servidor
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])

  // Injetar o Match Score e explicações em cada perfil
  const profilesWithScore = useMemo(() => {
    return profiles.map(p => {
      const match = calculateMatchScore(currentUser, p)
      return {
        ...p,
        matchScore: match.score,
        matchReasons: match.reasons
      }
    })
  }, [profiles, currentUser])

  // Filtragem e Ordenação do Feed
  const filteredAndSortedProfiles = useMemo(() => {
    let result = profilesWithScore

    // Filtro de busca textual (nome, habilidades, curso, objetivos)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter(p => 
        p.full_name?.toLowerCase().includes(query) || 
        p.course?.toLowerCase().includes(query) || 
        p.main_goal?.toLowerCase().includes(query) ||
        p.top_skills?.some((s: string) => s.toLowerCase().includes(query))
      )
    }

    // Filtros estruturados
    if (courseFilter) result = result.filter(p => p.course === courseFilter)
    if (goalFilter) result = result.filter(p => p.main_goal === goalFilter)
    if (skillFilter) result = result.filter(p => p.top_skills?.includes(skillFilter))
    if (shiftFilter) result = result.filter(p => p.shift === shiftFilter)

    // Ordenar primeiro pelo Match Score (decrescente)
    result.sort((a, b) => b.matchScore - a.matchScore)

    return result
  }, [profilesWithScore, searchQuery, courseFilter, goalFilter, skillFilter, shiftFilter])

  // Categorizar Conexões para a aba de conexões
  const connectionsData = useMemo(() => {
    const pendingReceived: any[] = []
    const pendingSent: any[] = []
    const matches: any[] = []

    profilesWithScore.forEach(p => {
      if (p.connectionState) {
        const conn = p.connectionState
        const mappedUser = { ...p, connectionId: conn.id }

        if (conn.status === 'accepted') {
          matches.push(mappedUser)
        } else if (conn.status === 'pending') {
          if (conn.isSender) {
            pendingSent.push(mappedUser)
          } else {
            pendingReceived.push(mappedUser)
          }
        }
      }
    })

    return { pendingReceived, pendingSent, matches }
  }, [profilesWithScore])

  // Ações de Conexão com Atualizações Otimistas para feedback instantâneo
  const handleConnect = async (receiverId: string) => {
    // 1. Atualização Otimista
    setProfiles(prev => prev.map(p => {
      if (p.id === receiverId) {
        return {
          ...p,
          connectionState: {
            id: 'temp-id',
            status: 'pending',
            isSender: true
          }
        }
      }
      return p
    }))
    
    // Atualizar no modal aberto se houver
    if (selectedProfile && selectedProfile.id === receiverId) {
      setSelectedProfile((prev: any) => prev ? {
        ...prev,
        connectionState: {
          id: 'temp-id',
          status: 'pending',
          isSender: true
        }
      } : null)
    }

    const res = await sendConnectionRequestAction(receiverId)
    if (res.error) {
      toast.error(res.error)
      // Se já existia uma solicitação pendente do outro usuário, o refresh exibirá "Aceitar/Recusar"
      router.refresh()
    } else {
      toast.success('Solicitação de conexão enviada!')
      router.refresh()
    }
  }

  const handleAccept = async (connId: string) => {
    const matchProfile = profiles.find(p => p.connectionState?.id === connId)
    if (matchProfile) {
      // Atualização Otimista
      setProfiles(prev => prev.map(p => {
        if (p.id === matchProfile.id) {
          return {
            ...p,
            connectionState: {
              ...p.connectionState,
              status: 'accepted'
            }
          }
        }
        return p
      }))

      if (selectedProfile && selectedProfile.id === matchProfile.id) {
        setSelectedProfile((prev: any) => prev ? {
          ...prev,
          connectionState: {
            ...prev.connectionState,
            status: 'accepted'
          }
        } : null)
      }
    }

    const res = await acceptConnectionRequestAction(connId)
    if (res.error) {
      toast.error(res.error)
      router.refresh()
    } else {
      toast.success('Conexão aceita! Vocês agora são Matches.')
      router.refresh()
    }
  }

  const handleDecline = async (connId: string) => {
    const matchProfile = profiles.find(p => p.connectionState?.id === connId)
    if (matchProfile) {
      // Atualização Otimista
      setProfiles(prev => prev.map(p => {
        if (p.id === matchProfile.id) {
          return {
            ...p,
            connectionState: null
          }
        }
        return p
      }))

      if (selectedProfile && selectedProfile.id === matchProfile.id) {
        setSelectedProfile((prev: any) => prev ? {
          ...prev,
          connectionState: null
        } : null)
      }
    }

    const res = await declineConnectionRequestAction(connId)
    if (res.error) {
      toast.error(res.error)
      router.refresh()
    } else {
      toast.success('Solicitação recusada.')
      router.refresh()
    }
  }

  const handleCancel = async (connId: string) => {
    const matchProfile = profiles.find(p => p.connectionState?.id === connId)
    if (matchProfile) {
      // Atualização Otimista
      setProfiles(prev => prev.map(p => {
        if (p.id === matchProfile.id) {
          return {
            ...p,
            connectionState: null
          }
        }
        return p
      }))

      if (selectedProfile && selectedProfile.id === matchProfile.id) {
        setSelectedProfile((prev: any) => prev ? {
          ...prev,
          connectionState: null
        } : null)
      }
    }

    const res = await cancelConnectionRequestAction(connId)
    if (res.error) {
      toast.error(res.error)
      router.refresh()
    } else {
      toast.success('Solicitação cancelada/desfeita.')
      router.refresh()
    }
  }

  return (
    <div className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col transition-colors duration-300">
      
      {/* Abas e Título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-5 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">ConnectFAESA</h1>
          <p className="text-gray-500 dark:text-zinc-400 mt-1">Conecte-se com alunos para TCCs, startups e grupos de estudo.</p>
        </div>
        
        {/* Switcher de Abas */}
        <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-2xl self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'feed' 
                ? 'bg-white dark:bg-zinc-800 text-faesa-blue dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
            }`}
          >
            <Users size={18} />
            Feed de Alunos
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'connections' 
                ? 'bg-white dark:bg-zinc-800 text-faesa-blue dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-200'
            }`}
          >
            <UserCheck size={18} />
            Conexões
            {connectionsData.pendingReceived.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white dark:border-zinc-900 animate-pulse">
                {connectionsData.pendingReceived.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'feed' ? (
        <div className="flex-grow flex flex-col md:flex-row gap-8 relative items-start">
          {/* Botão de Filtro Mobile */}
          <div className="md:hidden w-full flex gap-3 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3.5 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nome, habilidade..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-faesa-blue text-sm text-gray-900 dark:text-white"
              />
            </div>
            <button 
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-gray-700 dark:text-zinc-300 font-semibold shadow-sm cursor-pointer"
            >
              <Filter size={18} />
            </button>
          </div>

          {/* Sidebar de Filtros (Desktop) */}
          <aside className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-white dark:bg-zinc-900/60 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-zinc-800 sticky top-24 space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-zinc-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Filter size={20} className="text-faesa-blue dark:text-blue-400" /> Filtros
                </h2>
                {(courseFilter || goalFilter || skillFilter || shiftFilter) && (
                  <button 
                    onClick={() => { setCourseFilter(''); setGoalFilter(''); setSkillFilter(''); setShiftFilter('') }}
                    className="text-xs text-red-500 hover:underline font-semibold cursor-pointer"
                  >
                    Limpar
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Objetivo</label>
                  <CustomSelect
                    value={goalFilter}
                    onChange={setGoalFilter}
                    options={goalOptions}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Habilidade Oferecida</label>
                  <CustomSelect
                    value={skillFilter}
                    onChange={setSkillFilter}
                    options={skillOptions}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Turno</label>
                  <CustomSelect
                    value={shiftFilter}
                    onChange={setShiftFilter}
                    options={shiftOptions}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Curso</label>
                  <CustomSelect
                    value={courseFilter}
                    onChange={setCourseFilter}
                    options={courseOptions}
                  />
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
                  className="w-full bg-white dark:bg-zinc-900 rounded-t-3xl p-6 shadow-xl max-h-[85vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Filtros</h2>
                    <button onClick={() => setShowFilters(false)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full cursor-pointer">
                      <X size={20} className="text-gray-600 dark:text-zinc-300" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Objetivo</label>
                      <CustomSelect
                        value={goalFilter}
                        onChange={setGoalFilter}
                        options={goalOptionsMobile}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Habilidade Oferecida</label>
                      <CustomSelect
                        value={skillFilter}
                        onChange={setSkillFilter}
                        options={skillOptionsMobile}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Turno</label>
                      <CustomSelect
                        value={shiftFilter}
                        onChange={setShiftFilter}
                        options={shiftOptionsMobile}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">Curso</label>
                      <CustomSelect
                        value={courseFilter}
                        onChange={setCourseFilter}
                        options={courseOptionsMobile}
                      />
                    </div>
                    
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="w-full bg-faesa-blue text-white py-4 rounded-xl font-bold mt-4 shadow-md cursor-pointer"
                    >
                      Aplicar Filtros
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Grid de Perfis */}
          <main className="flex-grow w-full">
            {/* Barra de Pesquisa Desktop */}
            <div className="hidden md:flex items-center bg-white dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm px-4 py-3 mb-6">
              <Search className="text-gray-400 mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Buscar alunos por nome, curso ou habilidades..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
              />
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <ProfileCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredAndSortedProfiles.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-gray-200 dark:border-zinc-800 p-12 text-center shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 dark:text-zinc-200 mb-2">Nenhum aluno encontrado</h3>
                <p className="text-gray-500 dark:text-zinc-400">Tente ajustar seus termos de busca ou filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      ) : (
        /* Aba de Conexões */
        <main className="flex-grow space-y-12">
          
          {/* Seção: Solicitações Recebidas */}
          {connectionsData.pendingReceived.length > 0 && (
            <section className="bg-blue-50/50 dark:bg-blue-950/10 p-6 sm:p-8 rounded-3xl border border-blue-100 dark:border-blue-900/30">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-6 flex items-center gap-2">
                <Clock size={22} className="text-blue-600 dark:text-blue-400" /> Solicitações Recebidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectionsData.pendingReceived.map(profile => (
                  <div key={profile.id} className="bg-white dark:bg-zinc-900/60 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center font-bold">
                          {profile.full_name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{profile.full_name}</h4>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1">{profile.course} • {profile.shift}</p>
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-zinc-500 block mb-1">Objetivo:</span>
                        <span className="text-xs font-semibold bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 px-2.5 py-1 rounded-md border border-gray-150 dark:border-zinc-700">{profile.main_goal}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-zinc-850">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAccept(profile.connectionId)}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Check size={14} /> Aceitar
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDecline(profile.connectionId)}
                        className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-355 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Recusar
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Seção: Conexões Estabelecidas (Matches) */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Star size={22} className="text-amber-500 fill-amber-500" /> Conexões Aceitas (Matches)
            </h2>
            {connectionsData.matches.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-gray-200 dark:border-zinc-800 p-12 text-center max-w-2xl mx-auto shadow-sm">
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Users size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-805 dark:text-zinc-200 mb-1">Nenhum match ativo ainda</h3>
                <p className="text-gray-500 dark:text-zinc-400 text-sm max-w-sm mx-auto">Navegue no feed e envie solicitações de conexão para alunos com interesses parecidos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectionsData.matches.map(profile => (
                  <ProfileCard 
                    key={profile.id} 
                    profile={profile} 
                    onOpen={() => setSelectedProfile(profile)} 
                  />
                ))}
              </div>
            )}
          </section>

          {/* Seção: Solicitações Enviadas */}
          {connectionsData.pendingSent.length > 0 && (
            <section className="pt-6 border-t border-gray-200 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <ArrowRight size={22} className="text-gray-500" /> Solicitações Enviadas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectionsData.pendingSent.map(profile => (
                  <div key={profile.id} className="bg-white dark:bg-zinc-900/60 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 flex flex-col justify-between h-full opacity-85 hover:opacity-100 transition-opacity">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-full flex items-center justify-center font-bold">
                          {profile.full_name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{profile.full_name}</h4>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1">{profile.course} • {profile.shift}</p>
                        </div>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs text-gray-500 dark:text-zinc-450">Aguardando resposta do parceiro ideal...</span>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCancel(profile.connectionId)}
                      className="w-full mt-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold rounded-xl text-xs cursor-pointer"
                    >
                      Cancelar Solicitação
                    </motion.button>
                  </div>
                ))}
              </div>
            </section>
          )}

        </main>
      )}

      {/* Modal de Detalhes do Perfil */}
      <AnimatePresence>
        {selectedProfile && (
          <ProfileModal 
            profile={selectedProfile} 
            currentUser={currentUser}
            onClose={() => setSelectedProfile(null)} 
            onConnect={handleConnect}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>

    </div>
  )
}

