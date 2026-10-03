'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { updatePasswordAction } from '@/actions/auth'
import { Brand } from '@/components/layout/Navbar'
import { TypeRepeater } from '@/components/layout/TypeRepeater'

export default function ResetPasswordClient() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (password.length < 6) return toast.error('A senha precisa ter pelo menos 6 caracteres.')
    if (password !== confirm) return toast.error('As senhas não coincidem.')
    setBusy(true)
    const result = await updatePasswordAction(password)
    setBusy(false)
    if (result.error) toast.error(result.error)
    else { toast.success('Senha atualizada.'); router.push('/') }
  }
  return <div className="auth-shell"><aside className="type-stage auth-story"><TypeRepeater /><div className="auth-story-content"><p className="eyebrow" style={{ color: '#c9d9ff' }}>Connect FAESA</p><h2 className="display">De volta à sua <span className="script">jornada.</span></h2></div></aside><section className="auth-panel"><div className="auth-card"><Brand /><p className="eyebrow" style={{ marginTop: 55 }}>Segurança da conta</p><h1 className="display">Nova senha.</h1><p className="muted" style={{ marginTop: 12 }}>Escolha uma senha para continuar suas conexões.</p><form onSubmit={submit}><div className="field-row"><label className="label" htmlFor="password">Nova senha</label><input id="password" className="field" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div><div className="field-row"><label className="label" htmlFor="confirm">Confirme a senha</label><input id="confirm" className="field" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></div><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Salvando...' : 'Salvar nova senha'} <ArrowRight size={17} /></button></form></div></section></div>
}
