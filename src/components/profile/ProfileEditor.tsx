'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, ChevronDown, LockKeyhole, X } from 'lucide-react'
import { toast } from 'sonner'
import { updateProfileAction } from '@/actions/profile'
import { coursesFor, findCourse, type Modality } from '@/lib/catalog'
import { GOALS, HOURS, onboardingSchema, SHIFTS, SKILL_OPTIONS, type OnboardingData } from '@/lib/validations/onboarding'
import { TypeRepeater } from '@/components/layout/TypeRepeater'

type Props = {
  mode: 'onboarding' | 'edit'
  email: string
  profile?: Partial<OnboardingData>
  onDone?: (profile: OnboardingData) => void
  onClose?: () => void
}

const DRAFT_KEY = 'connectfaesa:onboarding-draft'

const STEPS = [
  { label: 'Você', title: 'Primeiro, você.', action: 'Escolher meu curso', lead: 'Seu nome abre', script: 'caminhos.', note: 'Vamos começar pelo essencial. Seu contato fica para o final.' },
  { label: 'Vida acadêmica', title: 'Sua vida acadêmica.', action: 'Contar meus interesses', lead: 'Encontre quem vive as mesmas', script: 'matérias.', note: 'Escolha seu curso e, se quiser, as matérias que está estudando agora.' },
  { label: 'Interesses', title: 'O que move você?', action: 'Revisar meu perfil', lead: 'Boas ideias começam com', script: 'trocas.', note: 'Mostre o que você oferece e o que gostaria de encontrar.' },
  { label: 'Revisão', title: 'Pronto para conectar.', action: 'Entrar na comunidade', lead: 'Sua próxima conexão está', script: 'perto.', note: 'Revise seu perfil e decida como compartilhar seus dados.' },
] as const

type CoursePeriod = NonNullable<ReturnType<typeof findCourse>>['periods'][number]

function SubjectPeriod({ period, initiallyOpen, selected, onToggle }: { period: CoursePeriod; initiallyOpen: boolean; selected: string[]; onToggle: (subject: string) => void }) {
  const [open, setOpen] = useState(initiallyOpen)
  const selectedCount = period.subjects.filter((subject) => selected.includes(subject)).length

  return <div className="subject-group">
    <button type="button" className="subject-group-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
      <span>{period.label}</span>
      <span className="subject-group-meta">{selectedCount > 0 ? `${selectedCount} ${selectedCount === 1 ? 'selecionada' : 'selecionadas'}` : `${period.subjects.length} matérias`} <ChevronDown size={16} aria-hidden="true" /></span>
    </button>
    {open && <div className="subject-list">{period.subjects.map((subject) => <Choice key={subject} selected={selected.includes(subject)} onClick={() => onToggle(subject)}>{subject}</Choice>)}</div>}
  </div>
}

function Choice({ selected, children, onClick, disabled }: { selected: boolean; children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" className="choice" aria-pressed={selected} onClick={onClick} disabled={disabled}>{selected && <Check size={14} />} {children}</button>
}

export default function ProfileEditor({ mode, email, profile, onDone, onClose }: Props) {
  const router = useRouter()
  const closeRef = useRef<HTMLButtonElement>(null)
  const wizardHeaderRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (mode !== 'edit') return
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mode, onClose])
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [draftLoaded, setDraftLoaded] = useState(false)
  const { register, control, setValue, trigger, clearErrors, handleSubmit, getValues, reset, subscribe, formState: { errors } } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: profile?.full_name ?? '',
      whatsapp: profile?.whatsapp ?? '',
      institutional_email: email,
      modality: profile?.modality ?? 'Presencial',
      course: profile?.course ?? '',
      shift: profile?.shift ?? ('Matutino' as OnboardingData['shift']),
      study_subjects: profile?.study_subjects ?? [],
      main_goal: profile?.main_goal ?? 'Grupo de Estudos',
      specific_goal: profile?.specific_goal ?? '',
      top_skills: profile?.top_skills ?? [],
      specific_skills: profile?.specific_skills ?? {},
      partner_needs: profile?.partner_needs ?? [],
      availability_hours: profile?.availability_hours ?? '1 a 3',
      consent_lgpd: profile?.consent_lgpd ?? false,
      feedback: profile?.feedback ?? '',
    },
  })
  const modality = useWatch({ control, name: 'modality' })
  const courseName = useWatch({ control, name: 'course' })
  const selectedSubjects = useWatch({ control, name: 'study_subjects' }) ?? []
  const shift = useWatch({ control, name: 'shift' })
  const mainGoal = useWatch({ control, name: 'main_goal' })
  const availability = useWatch({ control, name: 'availability_hours' })
  const topSkills = useWatch({ control, name: 'top_skills' }) ?? []
  const partnerNeeds = useWatch({ control, name: 'partner_needs' }) ?? []
  const course = findCourse(modality, courseName)
  const isEdit = mode === 'edit'

  useEffect(() => {
    if (isEdit) return
    let restoredStep = 0
    try {
      const raw = window.sessionStorage.getItem(DRAFT_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as { version?: number; email?: string; step?: number; values?: Record<string, unknown> }
        if (saved.version === 1 && saved.email === email.toLowerCase() && saved.values && typeof saved.values === 'object') {
          const values = saved.values
          const current = getValues()
          const stringValue = (key: keyof OnboardingData) => typeof values[key] === 'string' ? values[key] as string : current[key] as string
          const stringArray = (key: 'study_subjects' | 'top_skills' | 'partner_needs') => Array.isArray(values[key]) ? values[key].filter((item): item is string => typeof item === 'string') : current[key]
          reset({
            ...current,
            full_name: stringValue('full_name'),
            whatsapp: stringValue('whatsapp'),
            institutional_email: email,
            modality: values.modality === 'EAD' ? 'EAD' : 'Presencial',
            course: stringValue('course'),
            shift: SHIFTS.includes(values.shift as OnboardingData['shift']) ? values.shift as OnboardingData['shift'] : current.shift,
            study_subjects: stringArray('study_subjects'),
            main_goal: GOALS.includes(values.main_goal as OnboardingData['main_goal']) ? values.main_goal as OnboardingData['main_goal'] : current.main_goal,
            specific_goal: stringValue('specific_goal'),
            top_skills: stringArray('top_skills'),
            partner_needs: stringArray('partner_needs'),
            availability_hours: HOURS.includes(values.availability_hours as OnboardingData['availability_hours']) ? values.availability_hours as OnboardingData['availability_hours'] : current.availability_hours,
            consent_lgpd: values.consent_lgpd === true,
            feedback: stringValue('feedback'),
          })
          if (Number.isInteger(saved.step)) restoredStep = Math.min(3, Math.max(0, saved.step as number))
        }
      }
    } catch { /* A damaged or unavailable draft should never block onboarding. */ }
    const frame = window.requestAnimationFrame(() => {
      setStep(restoredStep)
      setDraftLoaded(true)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [email, getValues, isEdit, reset])

  useEffect(() => {
    if (isEdit || !draftLoaded) return
    let timer: number | undefined
    const save = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        try { window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, email: email.toLowerCase(), step, values: getValues() })) }
        catch { /* Storage may be unavailable in private browsing. */ }
      }, 300)
    }
    const unsubscribe = subscribe({ formState: { values: true }, callback: save })
    save()
    return () => { window.clearTimeout(timer); unsubscribe() }
  }, [draftLoaded, email, getValues, isEdit, step, subscribe])

  function chooseModality(next: Modality) {
    setValue('modality', next, { shouldValidate: true })
    setValue('course', '')
    setValue('study_subjects', [])
    setValue('shift', next === 'EAD' ? 'EAD' : 'Matutino')
  }

  function chooseSubject(subject: string) {
    const next = selectedSubjects.includes(subject)
      ? selectedSubjects.filter((item) => item !== subject)
      : [...selectedSubjects, subject]
    if (next.length > 8) return toast.error('Escolha até 8 matérias em estudo.')
    setValue('study_subjects', next, { shouldValidate: true, shouldDirty: true })
  }

  function moveToStep(next: number) {
    setStep(next)
    window.requestAnimationFrame(() => wizardHeaderRef.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }))
  }

  async function nextStep() {
    const fields: (keyof OnboardingData)[][] = [
      ['full_name', 'institutional_email'],
      ['modality', 'course', 'shift', 'study_subjects'],
      ['main_goal', 'top_skills', 'partner_needs'],
    ]
    if (await trigger(fields[step])) {
      clearErrors()
      moveToStep(step + 1)
    }
  }

  async function submit(data: OnboardingData) {
    setBusy(true)
    try {
      const result = await updateProfileAction(data)
      if (result.error) return toast.error('Não foi possível salvar o perfil.', { description: result.error })
      if (!isEdit) { try { window.sessionStorage.removeItem(DRAFT_KEY) } catch { /* Ignore unavailable storage. */ } }
      toast.success(isEdit ? 'Perfil atualizado.' : 'Seu perfil está pronto!')
      if (onDone) onDone(data)
      else router.push('/dashboard')
    } catch {
      toast.error('Não foi possível salvar agora. Tente novamente.')
    } finally { setBusy(false) }
  }

  const show = (section: number) => isEdit || step === section
  const error = (field: keyof OnboardingData) => errors[field]?.message && <p className="field-error" role="alert">{String(errors[field]?.message)}</p>

  const form = <form onSubmit={isEdit || step === 3 ? handleSubmit(submit) : (event) => { event.preventDefault(); void nextStep() }} className="form-stack">
    {show(0) && <section className="surface form-section">
      {isEdit && <h2>Primeiro, você.</h2>}
      <div className="form-stack">
        <div><label className="label" htmlFor="full-name">Nome completo</label><input id="full-name" className="field" autoComplete="name" aria-invalid={!!errors.full_name} {...register('full_name')} />{error('full_name')}</div>
        <div><label className="label" htmlFor="institutional-email">E-mail institucional</label><input id="institutional-email" className="field" type="email" readOnly {...register('institutional_email')} /><p className="form-help">Seu e-mail confirma que você faz parte da FAESA.</p></div>
      </div>
    </section>}

    {show(1) && <section className="surface form-section">
      {isEdit && <h2>Sua vida acadêmica.</h2>}
      <div className="form-stack">
        <div><span className="label">Modalidade</span><div className="choice-row"><Choice selected={modality === 'Presencial'} onClick={() => chooseModality('Presencial')}>Presencial</Choice><Choice selected={modality === 'EAD'} onClick={() => chooseModality('EAD')}>EAD</Choice></div></div>
        <div><label className="label" htmlFor="course">Curso</label><select id="course" className="field" aria-invalid={!!errors.course} value={courseName} onChange={(event) => { setValue('course', event.target.value, { shouldValidate: true }); setValue('study_subjects', []) }}><option value="">Selecione seu curso</option>{coursesFor(modality).map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select>{error('course')}</div>
        {modality === 'Presencial' && <div><span className="label">Turno</span><div className="choice-row">{SHIFTS.filter((item) => item !== 'EAD').map((item) => <Choice key={item} selected={shift === item} onClick={() => setValue('shift', item, { shouldValidate: true })}>{item}</Choice>)}</div>{error('shift')}</div>}
        <div><div className="form-field-title"><span className="label">Matérias que você está estudando <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></span><span className="muted" style={{ fontSize: 12 }}>{selectedSubjects.length}/8</span></div>
          <p className="form-help" style={{ marginTop: 0, marginBottom: 12 }}>Selecione as matérias atuais para encontrar colegas com algo em comum. Você pode mudar depois.</p>
          {!course && <p className="muted" style={{ fontSize: 13 }}>Escolha seu curso para ver a grade.</p>}
          {course && !course.periods.length && <p className="muted" style={{ fontSize: 13 }}>A matriz deste curso não está disponível na página oficial no momento.</p>}
          {course && course.periods.length > 0 && <div className="subject-groups">{course.periods.map((period, index) => <SubjectPeriod period={period} initiallyOpen={index === 0} selected={selectedSubjects} onToggle={chooseSubject} key={`${courseName}-${period.label}-${index}`} />)}</div>}
          {course && <a href={course.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 10, color: 'var(--blue)', fontSize: 12, fontWeight: 700 }}>Consultar a matriz na FAESA ↗</a>}
          {error('study_subjects')}
        </div>
      </div>
    </section>}

    {show(2) && <section className="surface form-section">
      {isEdit && <h2>O que move você?</h2>}
      <div className="form-stack">
        <div><span className="label">Seu objetivo principal</span><div className="choice-row">{GOALS.map((goal) => <Choice key={goal} selected={mainGoal === goal} onClick={() => setValue('main_goal', goal)}>{goal}</Choice>)}</div></div>
        <div><label className="label" htmlFor="specific-goal">Conte mais sobre seu objetivo <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></label><textarea id="specific-goal" className="field" rows={2} placeholder="Ex.: formar um grupo para estudar cálculo às quartas" {...register('specific_goal')} /></div>
        <div><div className="form-field-title"><span className="label">Habilidades que você oferece · escolha de 1 a 2</span><span className="muted" style={{ fontSize: 12 }}>{topSkills.length}/2</span></div><Controller control={control} name="top_skills" render={({ field }) => <div className="choice-row">{SKILL_OPTIONS.map((skill) => <Choice key={skill} selected={field.value.includes(skill)} disabled={!field.value.includes(skill) && field.value.length >= 2} onClick={() => field.onChange(field.value.includes(skill) ? field.value.filter((item) => item !== skill) : [...field.value, skill])}>{skill.split('/')[0].trim()}</Choice>)}</div>} />{error('top_skills')}</div>
        <div><div className="form-field-title"><span className="label">O que procura em outra pessoa · escolha de 1 a 3</span><span className="muted" style={{ fontSize: 12 }}>{partnerNeeds.length}/3</span></div><Controller control={control} name="partner_needs" render={({ field }) => <div className="choice-row">{SKILL_OPTIONS.map((skill) => <Choice key={skill} selected={field.value.includes(skill)} disabled={!field.value.includes(skill) && field.value.length >= 3} onClick={() => field.onChange(field.value.includes(skill) ? field.value.filter((item) => item !== skill) : [...field.value, skill])}>{skill.split('/')[0].trim()}</Choice>)}</div>} />{error('partner_needs')}</div>
      </div>
    </section>}

    {show(3) && <section className="surface form-section">
      {isEdit && <h2>Pronto para conectar.</h2>}
      {!isEdit && <div className="wizard-review"><p className="student-card-caption">Seu perfil até aqui</p><strong>{courseName || 'Seu curso'} · {modality}</strong><span>{selectedSubjects.length ? `${selectedSubjects.length} ${selectedSubjects.length === 1 ? 'matéria selecionada' : 'matérias selecionadas'}` : 'Você pode adicionar matérias depois'} · {mainGoal}</span></div>}
      <div className="form-stack">
        <div><label className="label" htmlFor="whatsapp">WhatsApp com DDD</label><input id="whatsapp" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="(27) 99999-9999" aria-invalid={!!errors.whatsapp} {...register('whatsapp')} />{error('whatsapp')}<p className="form-help"><LockKeyhole size={14} aria-hidden="true" /> Seu número só aparece para uma pessoa depois que a conexão for aceita.</p></div>
        <div><span className="label">Tempo disponível por semana</span><div className="choice-row">{HOURS.map((hours) => <Choice key={hours} selected={availability === hours} onClick={() => setValue('availability_hours', hours)}>{hours} horas</Choice>)}</div></div>
        <div><label className="label" htmlFor="about">Algo mais sobre você? <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></label><textarea id="about" className="field" rows={3} placeholder="Conte sobre interesses, projetos ou seu jeito de estudar" {...register('feedback')} /></div>
        <div><label className="wizard-consent"><input type="checkbox" {...register('consent_lgpd')} /><span>Concordo em mostrar meus dados acadêmicos aos estudantes autenticados do Connect FAESA. Meu e-mail e WhatsApp só serão compartilhados após uma conexão aceita.</span></label>{error('consent_lgpd')}</div>
      </div>
    </section>}

    {isEdit ? <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button type="button" className="btn btn-quiet" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Salvando...' : 'Salvar alterações'} <Check size={17} /></button></div> : <div className="wizard-actions"><button type="button" className="btn btn-quiet" onClick={() => moveToStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft size={16} /> Voltar</button>{step < 3 ? <button type="button" className="btn btn-primary" onClick={nextStep}>{STEPS[step].action} <ArrowRight size={16} /></button> : <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Salvando...' : STEPS[step].action} <ArrowRight size={16} /></button>}</div>}
  </form>

  if (isEdit) return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.() }}><div className="surface modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title"><div className="modal-top" style={{ marginBottom: 24 }}><div><p className="eyebrow">Meu espaço</p><h2 id="edit-profile-title" className="display" style={{ fontSize: 34, marginTop: 8 }}>Editar perfil</h2></div><button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label="Fechar edição"><X size={20} /></button></div>{form}</div></div>

  return <div className="wizard">
    <aside className="type-stage wizard-aside">
      <TypeRepeater />
      <div className="wizard-aside-content" key={step}>
        <p className="eyebrow" style={{ color: '#c9d9ff' }}>Connect FAESA</p>
        <h1 className="display">{STEPS[step].lead} <span className="script">{STEPS[step].script}</span></h1>
        <p className="wizard-aside-note">{STEPS[step].note}</p>
        <ol className="wizard-stage-list" aria-label="Progresso do perfil">
          {STEPS.map((item, index) => <li key={item.label} className={index === step ? 'is-current' : index < step ? 'is-done' : ''} aria-current={index === step ? 'step' : undefined}><span>{String(index + 1).padStart(2, '0')}</span>{item.label}</li>)}
        </ol>
      </div>
      <p className="wizard-privacy"><LockKeyhole size={15} aria-hidden="true" /> Seus dados de contato ficam privados até uma conexão aceita.</p>
    </aside>
    <div className="wizard-main"><div className="wizard-main-inner" ref={wizardHeaderRef}>
      <div className="wizard-topline"><span className="step-progress">Etapa {step + 1} de 4 · {STEPS[step].label}</span><Link href="/" className="muted">Connect FAESA</Link></div>
      <div className="step-bar" role="progressbar" aria-label="Progresso do perfil" aria-valuemin={1} aria-valuemax={4} aria-valuenow={step + 1}>{[0, 1, 2, 3].map((item) => <span key={item} className={item <= step ? 'done' : ''} />)}</div>
      <h2 className="display">{STEPS[step].title}</h2>
      <p className="muted wizard-step-copy">{STEPS[step].note}</p>
      {form}
      <p className="wizard-draft-note">Seu progresso fica salvo temporariamente nesta aba até concluir o perfil.</p>
    </div></div>
  </div>
}
