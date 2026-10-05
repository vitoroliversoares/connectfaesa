'use client'

import { useEffect, useRef } from 'react'
import { ArrowRight, BookOpenText, Check, Clock3, LockKeyhole, MessageCircle, X } from 'lucide-react'
import { calculateMatchScore } from '@/lib/match'

type Student = {
  id: string; full_name: string; course: string; modality?: string | null; shift?: string | null
  main_goal?: string | null; specific_goal?: string | null; study_subjects?: string[] | null
  top_skills?: string[] | null; partner_needs?: string[] | null; availability_hours?: string | null
  whatsapp?: string | null; feedback?: string | null
  connectionState?: { id: string; status: string; isSender: boolean } | null
}

export default function ProfileModal({ profile, currentUser, busy, onClose, onAction }: { profile: Student; currentUser: Student; busy: boolean; onClose: () => void; onAction: (action: 'connect' | 'accept' | 'decline' | 'cancel') => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])
  const match = calculateMatchScore(currentUser, profile)
  const state = profile.connectionState
  const phone = profile.whatsapp?.replace(/\D/g, '')
  const phoneUrl = phone ? `https://wa.me/${phone.startsWith('55') ? phone : `55${phone}`}?text=${encodeURIComponent(`Olá ${profile.full_name.split(' ')[0]}! Vi seu perfil no Connect FAESA. Vamos conversar?`)}` : null
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><div className="surface modal-card" role="dialog" aria-modal="true" aria-labelledby="student-title"><div className="modal-top"><div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><div className="avatar" style={{ width: 58, height: 58 }}>{profile.full_name.charAt(0).toUpperCase()}</div><div><h2 id="student-title" className="display" style={{ fontSize: 27 }}>{profile.full_name}</h2><p className="muted" style={{ fontSize: 13, marginTop: 4 }}>{profile.course} · {profile.modality || profile.shift || 'FAESA'}</p></div></div><button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label="Fechar perfil"><X size={19} /></button></div>
    <hr className="divider" style={{ margin: '25px 0' }} />
    <div style={{ display: 'grid', gap: 22 }}>
      <section><p className="eyebrow">Quer fazer</p><p style={{ fontSize: 19, fontWeight: 700, marginTop: 8 }}>{profile.main_goal || 'Conhecer outros estudantes'}</p>{profile.specific_goal && <p className="muted" style={{ marginTop: 5, fontSize: 14 }}>{profile.specific_goal}</p>}</section>
      <section><p className="eyebrow">Matérias em estudo</p><div className="choice-row" style={{ marginTop: 10 }}>{profile.study_subjects?.length ? profile.study_subjects.map((item) => <span key={item} className={`chip ${match.subjects.includes(item) ? 'chip-selected' : ''}`}><BookOpenText size={13} />{item}</span>) : <p className="muted" style={{ fontSize: 13 }}>Ainda não adicionou matérias.</p>}</div></section>
      {match.reasons.length > 0 && <section className="profile-affinity" aria-label="Afinidade acadêmica">
        <div className="profile-affinity-heading"><p className="eyebrow">Afinidade acadêmica</p><strong>{match.score}%</strong></div>
        <div className="profile-affinity-track" aria-hidden="true"><span style={{ width: `${match.score}%` }} /></div>
        <ul className="profile-affinity-reasons">{match.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      </section>}
      <div className="two-fields"><section><p className="eyebrow">Oferece</p><p className="muted" style={{ fontSize: 13, marginTop: 7 }}>{profile.top_skills?.map((item) => item.split('/')[0].trim()).join(', ') || 'Não informado'}</p></section><section><p className="eyebrow">Disponibilidade</p><p className="muted" style={{ fontSize: 13, marginTop: 7 }}><Clock3 size={14} style={{ display: 'inline', marginRight: 5 }} />{profile.availability_hours ? `${profile.availability_hours} horas por semana` : 'Não informada'}</p></section></div>
      {profile.feedback && <section><p className="eyebrow">Sobre</p><p className="muted" style={{ fontSize: 14, marginTop: 7, whiteSpace: 'pre-wrap' }}>{profile.feedback}</p></section>}
    </div>
    <hr className="divider" style={{ margin: '25px 0' }} />
    {!state && <div><p className="muted" style={{ fontSize: 12, marginBottom: 14 }}><LockKeyhole size={14} style={{ display: 'inline', marginRight: 5 }} />Contato liberado após um convite aceito.</p><button className="btn btn-primary" onClick={() => onAction('connect')} disabled={busy}>Enviar convite <ArrowRight size={16} /></button></div>}
    {state?.status === 'pending' && state.isSender && <div className="choice-row"><span className="chip">Convite enviado · aguardando resposta</span><button className="btn btn-quiet" onClick={() => onAction('cancel')} disabled={busy}>Cancelar convite</button></div>}
    {state?.status === 'pending' && !state.isSender && <div className="choice-row"><button className="btn btn-primary" onClick={() => onAction('accept')} disabled={busy}>Aceitar convite <Check size={16} /></button><button className="btn btn-quiet" onClick={() => onAction('decline')} disabled={busy}>Recusar</button></div>}
    {state?.status === 'accepted' && <div className="choice-row">{phoneUrl && <a className="btn btn-primary" href={phoneUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> Conversar no WhatsApp</a>}<button className="btn btn-quiet" onClick={() => onAction('cancel')} disabled={busy}>Desfazer conexão</button></div>}
    {state?.status === 'declined' && <div className="choice-row"><span className="chip">Convite encerrado</span><button className="btn btn-quiet" onClick={() => onAction('cancel')} disabled={busy}>Remover</button></div>}
  </div></div>
}
