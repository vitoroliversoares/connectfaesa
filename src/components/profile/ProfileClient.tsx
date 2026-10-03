'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, BookOpenText, KeyRound, LogOut, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { logoutAction, updatePasswordAction } from '@/actions/auth'
import EditProfileModal from './EditProfileModal'
import type { OnboardingData } from '@/lib/validations/onboarding'

type Profile = Partial<OnboardingData> & { id?: string }

export default function ProfileClient({ initialProfile, userEmail }: { initialProfile: Profile; userEmail: string }) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [editing, setEditing] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)

  async function changePassword(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < 6) return toast.error('A senha precisa ter pelo menos 6 caracteres.')
    if (password !== confirm) return toast.error('As senhas não coincidem.')
    setBusy(true)
    const result = await updatePasswordAction(password)
    setBusy(false)
    if (result.error) toast.error(result.error)
    else { toast.success('Senha atualizada.'); setPasswordOpen(false); setPassword(''); setConfirm('') }
  }

  return <div className="shell" style={{ paddingBottom: 100 }}>
    <div className="page-head"><Link href="/dashboard" className="muted" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}><ArrowLeft size={16} /> Voltar para descobrir</Link><p className="eyebrow" style={{ marginTop: 32 }}>Meu espaço</p><h1 className="display">Seu perfil, suas <span className="script" style={{ color: 'var(--blue)' }}>conexões.</span></h1><p>Mostre o que você está estudando e encontre pessoas para caminhar junto.</p></div>
    <div className="surface" style={{ padding: 'clamp(24px,4vw,42px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20 }}><div className="avatar" style={{ width: 76, height: 76, fontSize: 30 }}>{profile.full_name?.charAt(0)?.toUpperCase() || '?'}</div><div style={{ flex: '1 1 260px' }}><h2 className="display" style={{ fontSize: 31 }}>{profile.full_name}</h2><p className="muted" style={{ marginTop: 5, fontSize: 13 }}>{userEmail}</p><div className="choice-row" style={{ marginTop: 13 }}><span className="chip chip-selected">{profile.course || 'Curso não informado'}</span><span className="chip">{profile.modality || 'Presencial'} · {profile.shift}</span></div></div><button className="btn btn-primary" onClick={() => setEditing(true)}><Pencil size={16} /> Editar perfil</button></div>
    <div className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', marginTop: 18 }}>
      <section className="surface form-section"><p className="eyebrow">Agora estudando</p><h2 style={{ marginTop: 13, marginBottom: 15 }}>Minhas matérias</h2><div className="choice-row">{profile.study_subjects?.length ? profile.study_subjects.map((subject) => <span className="chip chip-selected" key={subject}><BookOpenText size={13} />{subject}</span>) : <p className="muted" style={{ fontSize: 13 }}>Adicione matérias para encontrar colegas estudando o mesmo assunto.</p>}</div>{!profile.study_subjects?.length && <button className="btn btn-quiet" style={{ marginTop: 18 }} onClick={() => setEditing(true)}>Adicionar matérias <ArrowRight size={15} /></button>}</section>
      <section className="surface form-section"><p className="eyebrow">Meu objetivo</p><h2 style={{ marginTop: 13, marginBottom: 8 }}>{profile.main_goal || 'Ainda não informado'}</h2><p className="muted" style={{ fontSize: 14 }}>{profile.specific_goal || 'Seu objetivo ajuda outras pessoas a entenderem o que podem criar ou estudar com você.'}</p><p className="eyebrow" style={{ marginTop: 24 }}>Disponibilidade</p><p style={{ marginTop: 6, fontSize: 14 }}>{profile.availability_hours ? `${profile.availability_hours} horas por semana` : 'Não informada'}</p></section>
      <section className="surface form-section"><p className="eyebrow">Troca de habilidades</p><h2 style={{ marginTop: 13, marginBottom: 12 }}>O que ofereço</h2><div className="choice-row">{profile.top_skills?.map((skill) => <span className="chip" key={skill}>{skill.split('/')[0].trim()}</span>)}</div><h2 style={{ marginTop: 25, marginBottom: 12 }}>O que procuro</h2><div className="choice-row">{profile.partner_needs?.map((skill) => <span className="chip" key={skill}>{skill.split('/')[0].trim()}</span>)}</div></section>
    </div>
    {profile.feedback && <section className="surface form-section" style={{ marginTop: 18 }}><p className="eyebrow">Sobre mim</p><p className="muted" style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{profile.feedback}</p></section>}
    <div className="choice-row" style={{ marginTop: 24 }}><button className="btn btn-quiet" onClick={() => setPasswordOpen(true)}><KeyRound size={17} /> Alterar senha</button><button className="btn btn-quiet" onClick={() => logoutAction()}><LogOut size={17} /> Sair da conta</button></div>

    {editing && <EditProfileModal profile={{ ...profile, institutional_email: userEmail }} onClose={() => setEditing(false)} onSave={(updated) => setProfile({ ...profile, ...updated })} />}
    {passwordOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setPasswordOpen(false) }}><div className="surface modal-card" role="dialog" aria-modal="true" aria-labelledby="password-title" style={{ maxWidth: 440 }}><div className="modal-top"><div><p className="eyebrow">Segurança</p><h2 id="password-title" className="display" style={{ fontSize: 31, marginTop: 8 }}>Alterar senha</h2></div><button className="modal-close" onClick={() => setPasswordOpen(false)} aria-label="Fechar"><X size={20} /></button></div><form onSubmit={changePassword} className="form-stack" style={{ marginTop: 25 }}><div><label className="label" htmlFor="new-password">Nova senha</label><input className="field" id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div><div><label className="label" htmlFor="confirm-password">Confirme a senha</label><input className="field" id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required /></div><button className="btn btn-primary" disabled={busy}>{busy ? 'Salvando...' : 'Salvar nova senha'}</button></form></div></div>}
  </div>
}
