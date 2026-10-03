'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { loginAction, registerAction, resetPasswordAction } from '@/actions/auth'
import { Brand } from '@/components/layout/Navbar'
import { TypeRepeater } from '@/components/layout/TypeRepeater'

function AuthContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(params.get('mode') === 'register' ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (params.get('error') === 'invalid_domain') toast.error('Use seu e-mail institucional da FAESA.')
    else if (params.get('error')) toast.error('Não foi possível concluir a autenticação. Tente novamente.')
  }, [params])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!/@(aluno\.)?faesa\.br$/i.test(email.trim())) {
      toast.error('Use um e-mail @aluno.faesa.br ou @faesa.br.')
      return
    }
    if (mode !== 'reset' && password.length < 6) {
      toast.error('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'reset') {
        const result = await resetPasswordAction(email)
        if (result.error) toast.error(result.error)
        else { toast.success('Enviamos o link de recuperação para seu e-mail.'); setMode('login') }
      } else if (mode === 'register') {
        const result = await registerAction(email, password)
        if (result.error) toast.error(result.error)
        else { toast.success('Confira seu e-mail para confirmar a conta.'); setMode('login'); setPassword('') }
      } else {
        const result = await loginAction(email, password)
        if (result.error) toast.error(result.error)
        else router.push(result.hasProfile ? '/dashboard' : '/onboarding')
      }
    } catch {
      toast.error('Não foi possível conectar agora. Tente novamente em instantes.')
    } finally { setBusy(false) }
  }

  const title = mode === 'register' ? 'Crie seu espaço.' : mode === 'reset' ? 'Recupere seu acesso.' : 'Bom ter você aqui.'
  return <div className="auth-shell">
    <aside className="type-stage auth-story"><TypeRepeater /><div className="auth-story-content"><p className="eyebrow" style={{ color: '#c9d9ff' }}>Connect FAESA</p><h2 className="display">Ideias crescem quando a gente se <span className="script">encontra.</span></h2><p style={{ marginTop: 22, color: '#d8e4fb', maxWidth: 420 }}>Pessoas, matérias e projetos em um só lugar.</p></div></aside>
    <section className="auth-panel"><div className="auth-card">
      <Brand />
      <p className="eyebrow" style={{ marginTop: 55 }}>{mode === 'register' ? 'Primeiro acesso' : mode === 'reset' ? 'Recuperar senha' : 'Acesso institucional'}</p>
      <h1 className="display">{title}</h1>
      <p className="muted" style={{ marginTop: 12 }}>{mode === 'register' ? 'Use seu e-mail da FAESA para começar a encontrar colegas.' : mode === 'reset' ? 'Enviaremos um link seguro para seu e-mail institucional.' : 'Entre para descobrir pessoas na mesma jornada que você.'}</p>
      <form onSubmit={submit} noValidate>
        <div className="field-row"><label className="label" htmlFor="email">E-mail institucional</label><input className="field" id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu.nome@aluno.faesa.br" required /></div>
        {mode !== 'reset' && <div className="field-row"><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><label className="label" htmlFor="password">Senha</label>{mode === 'login' && <button type="button" onClick={() => setMode('reset')} style={{ color: 'var(--blue)', fontSize: 12, fontWeight: 700 }}>Esqueci a senha</button>}</div><input className="field" id="password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" required /></div>}
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Aguarde...' : mode === 'register' ? 'Criar conta' : mode === 'reset' ? 'Enviar link' : 'Entrar'} {!busy && <ArrowRight size={17} />}</button>
      </form>
      <div className="auth-foot">
        {mode === 'login' ? <>Ainda não tem conta? <button type="button" onClick={() => setMode('register')} style={{ color: 'var(--blue)', fontWeight: 700 }}>Cadastre-se</button></> : <button type="button" onClick={() => setMode('login')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--blue)', fontWeight: 700 }}><ArrowLeft size={15} /> Voltar para entrar</button>}
      </div>
      <p className="auth-foot" style={{ marginTop: 42, fontSize: 12 }}>Seu perfil é visível apenas para estudantes autenticados. <Link href="/" style={{ color: 'var(--blue)', fontWeight: 700 }}>Conheça o Connect FAESA</Link></p>
    </div></section>
  </div>
}

export default function LoginPage() { return <Suspense fallback={<div className="auth-panel" style={{ minHeight: '100vh' }}>Carregando...</div>}><AuthContent /></Suspense> }
