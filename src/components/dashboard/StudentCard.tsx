import { BookOpenText } from 'lucide-react'
import { DirectionalArrow } from '@/components/layout/DirectionalArrow'

type ConnectionState = { id: string; status: string; isSender: boolean } | null

type StudentCardData = {
  id: string
  full_name: string
  course: string
  modality?: string | null
  shift?: string | null
  main_goal?: string | null
  study_subjects?: string[] | null
  top_skills?: string[] | null
  connectionState?: ConnectionState
  match: { score: number; subjects: string[] }
}

function ConnectionIndicator({ state }: { state?: ConnectionState }) {
  if (state?.status === 'accepted') {
    return <span className="student-card-status student-card-status-accepted">Conectados</span>
  }

  if (state?.status === 'pending') {
    const label = state.isSender ? 'Convite enviado' : 'Convite recebido'
    return <span className="student-card-status student-card-status-pending" aria-label={`${label}, pendente`}>{label}</span>
  }

  return null
}

export function StudentCard({ student, onOpen }: { student: StudentCardData; onOpen: () => void }) {
  const sharedSubjects = student.match.subjects
  const subjects = sharedSubjects.length ? sharedSubjects : student.study_subjects ?? []
  const visibleSubjects = subjects.slice(0, 2)
  const extraSubjects = Math.max(subjects.length - visibleSubjects.length, 0)
  const connection = student.connectionState?.status
  const connectionStyle = connection === 'accepted' || connection === 'pending' ? connection : undefined
  const goal = student.main_goal === 'Grupo de Estudos' ? 'Quer estudar em grupo' : student.main_goal || 'Aberto a conexões'

  return (
    <article className="surface student-card" data-connection={connectionStyle}>
      <div className="student-card-top">
        <div className="avatar" aria-hidden="true">{student.full_name?.charAt(0)?.toUpperCase() || '?'}</div>
        <div className="student-card-identity">
          <h3>{student.full_name}</h3>
          <p className="meta">{student.course}</p>
          <p className="student-card-modality">{student.modality || student.shift || 'FAESA'}</p>
          <ConnectionIndicator state={student.connectionState} />
        </div>
      </div>

      <div className="student-card-content">
        <div>
          <p className="student-card-caption">Objetivo</p>
          <p className="goal">{goal}</p>
        </div>

        <div>
          <p className="student-card-caption">{sharedSubjects.length ? 'Matérias em comum' : subjects.length ? 'Matérias em estudo' : 'Em destaque'}</p>
          <div className="tags">
            {visibleSubjects.map((item) => <span className={`chip ${sharedSubjects.length ? 'chip-selected' : ''}`} key={item}><BookOpenText size={13} />{item}</span>)}
            {extraSubjects > 0 && <span className="chip" aria-label={`${extraSubjects} ${extraSubjects === 1 ? 'outra matéria' : 'outras matérias'}`}>+{extraSubjects}</span>}
            {!subjects.length && <span className="chip">{student.top_skills?.[0]?.split('/')[0].trim() || 'Perfil acadêmico'}</span>}
          </div>
        </div>

        {student.match.score > 0 && <div className="student-card-match">
          <div className="student-card-match-label"><span>Afinidade acadêmica</span><strong>{student.match.score}%</strong></div>
          <div className="student-card-match-track" aria-hidden="true"><span style={{ width: `${student.match.score}%` }} /></div>
        </div>}
      </div>

      <button type="button" className="student-card-action" onClick={onOpen} aria-label={`Ver perfil de ${student.full_name}`}>
        <span>Ver perfil</span>
        <DirectionalArrow />
      </button>
    </article>
  )
}
