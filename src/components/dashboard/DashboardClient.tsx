'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { calculateMatchScore } from '@/lib/match'
import { courses } from '@/lib/catalog'
import { acceptConnectionRequestAction, cancelConnectionRequestAction, declineConnectionRequestAction, sendConnectionRequestAction } from '@/actions/connection'
import ProfileModal from './ProfileModal'
import { StudentCard } from './StudentCard'
import { MultiSelectFilter } from './MultiSelectFilter'

type ConnectionState = { id: string; status: string; isSender: boolean } | null
type Student = {
  id: string
  full_name: string
  course: string
  modality?: string | null
  shift?: string | null
  main_goal?: string | null
  specific_goal?: string | null
  study_subjects?: string[] | null
  top_skills?: string[] | null
  partner_needs?: string[] | null
  availability_hours?: string | null
  whatsapp?: string | null
  feedback?: string | null
  connectionState?: ConnectionState
}

export default function DashboardClient({ currentUser, initialProfiles }: { currentUser: Student; initialProfiles: Student[]; initialConnections?: unknown[] }) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tab, setTab] = useState<'discover' | 'connections'>('discover')
  const [query, setQuery] = useState('')
  const [modality, setModality] = useState('')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return
    const client = createClient()
    const channel = client.channel('connections-dashboard').on('postgres_changes', { event: '*', schema: 'public', table: 'connections' }, () => router.refresh()).subscribe()
    return () => { client.removeChannel(channel) }
  }, [router])

  const ranked = useMemo(() => initialProfiles.map((student) => ({ ...student, match: calculateMatchScore(currentUser, student) })).sort((a, b) => b.match.score - a.match.score), [initialProfiles, currentUser])
  const courseOptions = useMemo(() => [...new Set(courses.filter((item) => !modality || item.modality === modality).map((item) => item.name))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [modality])
  const subjectOptions = useMemo(() => [...new Set(ranked.filter((student) => (!modality || student.modality === modality) && (!selectedCourses.length || selectedCourses.includes(student.course))).flatMap((student) => student.study_subjects ?? []))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [ranked, modality, selectedCourses])
  const filtered = useMemo(() => ranked.filter((student) => {
    if (tab === 'connections' && !student.connectionState) return false
    if (query && ![student.full_name, student.course, student.main_goal, ...(student.study_subjects ?? [])].some((part) => part?.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')))) return false
    if (modality && student.modality !== modality) return false
    if (selectedCourses.length && !selectedCourses.includes(student.course)) return false
    if (selectedSubjects.length && !selectedSubjects.some((subject) => student.study_subjects?.includes(subject))) return false
    return true
  }), [ranked, tab, query, modality, selectedCourses, selectedSubjects])
  const selected = ranked.find((student) => student.id === selectedId) ?? null
  const connectionCount = ranked.filter((student) => student.connectionState?.status === 'accepted').length

  function changeModality(next: string) {
    const validCourses = new Set(courses.filter((item) => !next || item.modality === next).map((item) => item.name))
    const nextCourses = selectedCourses.filter((course) => validCourses.has(course))
    const validSubjects = new Set(ranked.filter((student) => (!next || student.modality === next) && (!nextCourses.length || nextCourses.includes(student.course))).flatMap((student) => student.study_subjects ?? []))
    setModality(next)
    setSelectedCourses(nextCourses)
    setSelectedSubjects((previous) => previous.filter((subject) => validSubjects.has(subject)))
  }

  function changeCourses(next: string[]) {
    const validSubjects = new Set(ranked.filter((student) => (!modality || student.modality === modality) && (!next.length || next.includes(student.course))).flatMap((student) => student.study_subjects ?? []))
    setSelectedCourses(next)
    setSelectedSubjects((previous) => previous.filter((subject) => validSubjects.has(subject)))
  }

  async function act(action: 'connect' | 'accept' | 'decline' | 'cancel', student: Student) {
    setBusy(true)
    try {
      const state = student.connectionState
      const result = action === 'connect' ? await sendConnectionRequestAction(student.id)
        : action === 'accept' && state ? await acceptConnectionRequestAction(state.id)
        : action === 'decline' && state ? await declineConnectionRequestAction(state.id)
        : state ? await cancelConnectionRequestAction(state.id) : { error: 'Conexão não encontrada.' }
      if (result.error) toast.error(result.error)
      else { toast.success(action === 'connect' ? 'Convite enviado.' : action === 'accept' ? 'Conexão aceita.' : action === 'decline' ? 'Convite recusado.' : 'Conexão removida.'); setSelectedId(null); router.refresh() }
    } catch { toast.error('Não foi possível atualizar a conexão agora.') }
    finally { setBusy(false) }
  }

  return <div className="dashboard-layout shell">
    <div className="page-head"><p className="eyebrow">Sua comunidade</p><h1 className="display">Encontre sua <span className="script" style={{ color: 'var(--blue)' }}>turma.</span></h1><p>Descubra estudantes que compartilham suas matérias, interesses e vontade de fazer acontecer.</p></div>
    <div className="surface dashboard-toolbar" aria-label="Filtrar estudantes"><Search size={18} style={{ color: 'var(--muted)' }} aria-hidden="true" /><input className="field" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pessoa ou matéria" aria-label="Buscar estudantes" /><select className="field" aria-label="Filtrar modalidade" value={modality} onChange={(event) => changeModality(event.target.value)}><option value="">Todas as modalidades</option><option>Presencial</option><option>EAD</option></select><MultiSelectFilter label="Cursos" allLabel="Todos os cursos" options={courseOptions} selected={selectedCourses} onChange={changeCourses} /><MultiSelectFilter label="Matérias" allLabel="Todas as matérias" options={subjectOptions} selected={selectedSubjects} onChange={setSelectedSubjects} /></div>
    <div style={{ marginTop: 30 }}><div className="tabs" role="tablist" aria-label="Estudantes e conexões"><button role="tab" aria-selected={tab === 'discover'} className="tab" onClick={() => setTab('discover')}>Descobrir · {ranked.length}</button><button role="tab" aria-selected={tab === 'connections'} className="tab" onClick={() => setTab('connections')}>Minhas conexões · {connectionCount}</button></div></div>
    {filtered.length ? <div className="profile-grid">{filtered.map((student) => <StudentCard student={student} onOpen={() => setSelectedId(student.id)} key={student.id} />)}</div> : <div className="surface empty-state" style={{ marginTop: 24 }}><SlidersHorizontal size={28} style={{ margin: 'auto', color: 'var(--blue)' }} /><h3>Ninguém por aqui ainda.</h3><p>{tab === 'connections' ? 'Quando você trocar convites com colegas, suas conexões aparecem aqui.' : 'Tente ajustar os filtros ou escolha outra matéria.'}</p>{(query || modality || selectedCourses.length > 0 || selectedSubjects.length > 0) && <button className="btn btn-quiet" style={{ marginTop: 20 }} onClick={() => { setQuery(''); setModality(''); setSelectedCourses([]); setSelectedSubjects([]) }}>Limpar filtros</button>}</div>}
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 30, color: 'var(--muted)', fontSize: 12 }}><UsersRound size={15} /> Seus dados de contato são mostrados apenas após uma conexão aceita.</div>
    {selected && <ProfileModal profile={selected} currentUser={currentUser} busy={busy} onClose={() => setSelectedId(null)} onAction={(action) => act(action, selected)} />}
  </div>
}
