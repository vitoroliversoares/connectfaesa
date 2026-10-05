'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import { loginAction, registerAction, resendSignupConfirmationAction, resetPasswordAction } from '@/actions/auth'
import { Brand } from '@/components/layout/Navbar'
import { TypeRepeater } from '@/components/layout/TypeRepeater'

type AuthMode = 'login' | 'register' | 'reset' | 'confirm' | 'reset-sent'

const institutionalEmail = /@(aluno\.)?faesa\.br$/i

function AuthContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [mode, setMode] = useState<AuthMode>(params.get('mode') === 'register' ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [touchedEmail, setTouchedEmail] = useState(false)
  const [touchedPassword, setTouchedPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [resendSeconds, setResendSeconds] = useState(0)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    if (params.get('error') === 'invalid_domain') toast.error('Use seu e-mail institucional da FAESA.')
    else if (params.get('error')) toast.error('Não foi possível concluir a autenticação. Tente novamente.')
  }, [params])

  useEffect(() => {
    if (resendSeconds <= 0) return
    const timer = window.setTimeout(() => setResendSeconds((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendSeconds])

  const emailValid = institutionalEmail.test(email.trim())
  const emailInvalid = (attempted || touchedEmail) && !emailValid
  const passwordInvalid = mode !== 'reset' && (attempted || touchedPassword) && password.length < 6
  const awaitingEmail = mode === 'confirm' || mode === 'reset-sent'
  const isRegister = mode === 'register'

  function changeMode(next: AuthMode) {
    setMode(next)
    setPassword('')
    setShowPassword(false)
    setAttempted(false)
    setTouchedPassword(false)
    setFormError(null)
    setResent(false)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setAttempted(true)
    setFormError(null)
    if (!emailValid || (mode !== 'reset' && password.length < 6)) return

    setBusy(true)
    try {
      if (mode === 'reset') {
        const result = await resetPasswordAction(email)
        if (result.error) setFormError(result.error)
        else changeMode('reset-sent')
      } else if (mode === 'register') {
        const result = await registerAction(email, password)
        if (result.error) setFormError(result.error)
        else if (result.needsConfirmation) {
          changeMode('confirm')
          setResendSeconds(60)
        } else {
          router.push('/onboarding')
        }
      } else {
        const result = await loginAction(email, password)
        if (result.error) setFormError(result.error)
        else router.push(result.hasProfile ? '/dashboard' : '/onboarding')
      }
    } catch {
      setFormError('Não foi possível conectar agora. Tente novamente em instantes.')
    } finally {
      setBusy(false)
    }
  }

  async function resendConfirmation() {
    if (busy || resendSeconds > 0) return
    setBusy(true)
    setFormError(null)
    try {
      const result = await resendSignupConfirmationAction(email)
      if (result.error) setFormError(result.error)
      else { setResent(true); setResendSeconds(60) }
    } catch {
      setFormError('Não foi possível reenviar agora. Tente novamente em instantes.')
    } finally {
      setBusy(false)
    }
  }

  const title = mode === 'register' ? 'Comece por aqui.' : mode === 'reset' ? 'Recupere seu acesso.' : 'Bom ter você aqui.'

  return <div className="auth-shell">
    <aside className="type-stage auth-story">
      <TypeRepeater />
      <div className="auth-story-content">
        <p className="eyebrow" style={{ color: '#c9d9ff' }}>Connect FAESA</p>
        <h2 className="display">Ideias crescem quando a gente se <span className="script">encontra.</span></h2>
        <p className="auth-story-copy">Pessoas, matérias e projetos em um só lugar.</p>
        {(isRegister || mode === 'confirm') && <ol className="auth-journey" aria-label="Etapas para começar">
          <li className={mode === 'register' ? 'is-current' : 'is-done'}><span>01</span><strong>Crie seu acesso</strong></li>
          <li className={mode === 'confirm' ? 'is-current' : ''}><span>02</span><strong>Confirme seu e-mail</strong></li>
          <li><span>03</span><strong>Escolha suas matérias</strong></li>
        </ol>}
      </div>
    </aside>

    <section className="auth-panel">
      <div className="auth-card">
        <Brand />

        {awaitingEmail ? <div className="auth-confirm" aria-live="polite">
          <div className="auth-confirm-icon"><MailCheck size={28} aria-hidden="true" /></div>
          <p className="eyebrow">{mode === 'confirm' ? 'Falta pouco' : 'Link solicitado'}</p>
          <h1 className="display">Confira seu e-mail.</h1>
          <p className="muted">{mode === 'confirm' ? 'Enviamos um link de confirmação para' : 'Enviamos um link de recuperação para'} <strong className="auth-confirm-email">{email.trim()}</strong>.</p>
          <ol className="auth-confirm-steps">
            <li><span>01</span><p>Abra a mensagem enviada pela FAESA.</p></li>
            <li><span>02</span><p>{mode === 'confirm' ? 'Confirme sua conta pelo link.' : 'Defina uma nova senha pelo link.'}</p></li>
            <li><span>03</span><p>{mode === 'confirm' ? 'Volte para escolher suas matérias e encontrar colegas.' : 'Entre novamente com sua nova senha.'}</p></li>
          </ol>
          <p className="auth-assist">Não encontrou a mensagem? Confira também a pasta de spam.</p>
          {formError && <p className="auth-error" role="alert">{formError}</p>}
          {resent && <p className="auth-success" role="status"><Check size={16} /> Um novo link foi solicitado.</p>}
          {mode === 'confirm' && <button type="button" className="btn btn-quiet auth-resend" onClick={resendConfirmation} disabled={busy || resendSeconds > 0}>{busy ? 'Reenviando...' : resendSeconds > 0 ? `Reenviar link em ${resendSeconds}s` : 'Reenviar link'}</button>}
          <button type="button" className="btn btn-primary auth-confirm-primary" onClick={() => changeMode('login')}>{mode === 'confirm' ? 'Já confirmei, entrar' : 'Voltar para entrar'} <ArrowRight size={17} /></button>
          {mode === 'confirm' && <button type="button" className="auth-text-button" onClick={() => changeMode('register')}>Corrigir meu e-mail</button>}
        </div> : <>
          {(mode === 'login' || mode === 'register') && <div className="auth-mode-switch" aria-label="Tipo de acesso">
            <button type="button" aria-pressed={mode === 'login'} onClick={() => changeMode('login')}>Entrar</button>
            <button type="button" aria-pressed={mode === 'register'} onClick={() => changeMode('register')}>Criar conta</button>
          </div>}
          <p className="eyebrow auth-heading-label">{isRegister ? 'Primeiro acesso' : mode === 'reset' ? 'Recuperar senha' : 'Acesso institucional'}</p>
          <h1 className="display">{title}</h1>
          <p className="muted auth-intro">{isRegister ? 'Agora, só e-mail e senha. Seu perfil acadêmico vem depois.' : mode === 'reset' ? 'Enviaremos um link seguro para seu e-mail institucional.' : 'Entre para descobrir pessoas na mesma jornada que você.'}</p>
          {isRegister && <p className="auth-reassurance"><Check size={15} aria-hidden="true" /> Seus dados de contato ficam privados até uma conexão aceita.</p>}

          <form onSubmit={submit} noValidate>
            {formError && <p className="auth-error" role="alert">{formError}</p>}
            <div className="field-row">
              <label className="label" htmlFor="email">E-mail institucional</label>
              <input className="field" id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} value={email} onChange={(event) => setEmail(event.target.value)} onBlur={() => setTouchedEmail(true)} placeholder="seu.nome@aluno.faesa.br" aria-invalid={emailInvalid} aria-describedby={emailInvalid ? 'email-error' : undefined} required />
              {emailInvalid && <p id="email-error" className="field-error" role="alert">Use um e-mail @aluno.faesa.br ou @faesa.br.</p>}
            </div>
            {mode !== 'reset' && <div className="field-row">
              <div className="auth-field-heading"><label className="label" htmlFor="password">Senha</label>{mode === 'login' && <button type="button" className="auth-text-button" onClick={() => changeMode('reset')}>Esqueci a senha</button>}</div>
              <div className="auth-password-field"><input className="field" id="password" type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} onBlur={() => setTouchedPassword(true)} placeholder="Mínimo de 6 caracteres" aria-invalid={passwordInvalid} aria-describedby={passwordInvalid ? 'password-error' : isRegister ? 'password-hint' : undefined} required /><button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
              {passwordInvalid ? <p id="password-error" className="field-error" role="alert">A senha precisa ter pelo menos 6 caracteres.</p> : isRegister && <p id="password-hint" className={`auth-field-hint ${password.length >= 6 ? 'is-valid' : ''}`}>{password.length >= 6 && <Check size={14} aria-hidden="true" />} Mínimo de 6 caracteres</p>}
            </div>}
            <button className="btn btn-primary auth-submit" type="submit" disabled={busy}><span aria-live="polite">{busy ? isRegister ? 'Criando conta...' : mode === 'reset' ? 'Enviando link...' : 'Entrando...' : isRegister ? 'Criar conta' : mode === 'reset' ? 'Enviar link' : 'Entrar'}</span>{!busy && <ArrowRight size={17} aria-hidden="true" />}</button>
          </form>

          {mode === 'reset' && <button type="button" className="auth-back" onClick={() => changeMode('login')}><ArrowLeft size={15} /> Voltar para entrar</button>}
          <p className="auth-foot">Seu perfil é visível apenas para estudantes autenticados. <Link href="/">Conheça o Connect FAESA</Link></p>
        </>}
      </div>
    </section>
  </div>
}

export default function LoginPage() {
  return <Suspense fallback={<div className="auth-panel" style={{ minHeight: '100vh' }}>Carregando...</div>}><AuthContent /></Suspense>
}
