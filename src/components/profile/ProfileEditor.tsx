'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
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

function Choice({ selected, children, onClick, disabled }: { selected: boolean; children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return <button type="button" className="choice" aria-pressed={selected} onClick={onClick} disabled={disabled}>{selected && <Check size={14} />} {children}</button>
}

export default function ProfileEditor({ mode, email, profile, onDone, onClose }: Props) {
  const router = useRouter()
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (mode !== 'edit') return
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mode, onClose])
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const { register, control, setValue, trigger, handleSubmit, formState: { errors } } = useForm<OnboardingData>({
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
  const course = findCourse(modality, courseName)
  const isEdit = mode === 'edit'

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

  async function nextStep() {
    const fields: (keyof OnboardingData)[][] = [
      ['full_name', 'whatsapp', 'institutional_email'],
      ['modality', 'course', 'shift', 'study_subjects'],
      ['main_goal', 'top_skills', 'partner_needs', 'availability_hours'],
    ]
    if (await trigger(fields[step])) setStep(step + 1)
  }

  async function submit(data: OnboardingData) {
    setBusy(true)
    try {
      const result = await updateProfileAction(data)
      if (result.error) return toast.error('Não foi possível salvar o perfil.', { description: result.error })
      toast.success(isEdit ? 'Perfil atualizado.' : 'Seu perfil está pronto!')
      if (onDone) onDone(data)
      else router.push('/dashboard')
    } catch {
      toast.error('Não foi possível salvar agora. Tente novamente.')
    } finally { setBusy(false) }
  }

  const show = (section: number) => isEdit || step === section
  const error = (field: keyof OnboardingData) => errors[field]?.message && <p className="field-error" role="alert">{String(errors[field]?.message)}</p>

  const form = <form onSubmit={handleSubmit(submit)} className="form-stack">
    {show(0) && <section className="surface form-section">
      <h2>Primeiro, você.</h2>
      <div className="form-stack">
        <div><label className="label" htmlFor="full-name">Nome completo</label><input id="full-name" className="field" autoComplete="name" aria-invalid={!!errors.full_name} {...register('full_name')} />{error('full_name')}</div>
        <div className="two-fields"><div><label className="label" htmlFor="whatsapp">WhatsApp com DDD</label><input id="whatsapp" className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="(27) 99999-9999" aria-invalid={!!errors.whatsapp} {...register('whatsapp')} />{error('whatsapp')}</div><div><label className="label" htmlFor="institutional-email">E-mail institucional</label><input id="institutional-email" className="field" type="email" readOnly {...register('institutional_email')} /><p className="muted" style={{ marginTop: 7, fontSize: 12 }}>Usado para validar seu acesso à comunidade.</p></div></div>
      </div>
    </section>}

    {show(1) && <section className="surface form-section">
      <h2>Sua vida acadêmica.</h2>
      <div className="form-stack">
        <div><span className="label">Modalidade</span><div className="choice-row"><Choice selected={modality === 'Presencial'} onClick={() => chooseModality('Presencial')}>Presencial</Choice><Choice selected={modality === 'EAD'} onClick={() => chooseModality('EAD')}>EAD</Choice></div></div>
        <div><label className="label" htmlFor="course">Curso</label><select id="course" className="field" aria-invalid={!!errors.course} value={courseName} onChange={(event) => { setValue('course', event.target.value, { shouldValidate: true }); setValue('study_subjects', []) }}><option value="">Selecione seu curso</option>{coursesFor(modality).map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select>{error('course')}</div>
        {modality === 'Presencial' && <div><span className="label">Turno</span><div className="choice-row">{SHIFTS.filter((item) => item !== 'EAD').map((item) => <Choice key={item} selected={shift === item} onClick={() => setValue('shift', item, { shouldValidate: true })}>{item}</Choice>)}</div>{error('shift')}</div>}
        <div><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}><span className="label">Matérias que você está estudando <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></span><span className="muted" style={{ fontSize: 12 }}>{selectedSubjects.length}/8</span></div>
          {!course && <p className="muted" style={{ fontSize: 13 }}>Escolha seu curso para ver a grade.</p>}
          {course && !course.periods.length && <p className="muted" style={{ fontSize: 13 }}>A matriz deste curso não está disponível na página oficial no momento.</p>}
          {course && course.periods.length > 0 && <div className="subject-groups">{course.periods.map((period, index) => <div className="subject-group" key={`${period.label}-${index}`}><h4>{period.label}</h4><div className="subject-list">{period.subjects.map((subject) => <Choice key={subject} selected={selectedSubjects.includes(subject)} onClick={() => chooseSubject(subject)}>{subject}</Choice>)}</div></div>)}</div>}
          {course && <a href={course.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 10, color: 'var(--blue)', fontSize: 12, fontWeight: 700 }}>Consultar a matriz na FAESA ↗</a>}
          {error('study_subjects')}
        </div>
      </div>
    </section>}

    {show(2) && <section className="surface form-section">
      <h2>O que move você?</h2>
      <div className="form-stack">
        <div><span className="label">Seu objetivo principal</span><div className="choice-row">{GOALS.map((goal) => <Choice key={goal} selected={mainGoal === goal} onClick={() => setValue('main_goal', goal)}>{goal}</Choice>)}</div></div>
        <div><label className="label" htmlFor="specific-goal">Conte mais sobre seu objetivo <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></label><textarea id="specific-goal" className="field" rows={2} placeholder="Ex.: formar um grupo para estudar cálculo às quartas" {...register('specific_goal')} /></div>
        <div><span className="label">Habilidades que você oferece · até 2</span><Controller control={control} name="top_skills" render={({ field }) => <div className="choice-row">{SKILL_OPTIONS.map((skill) => <Choice key={skill} selected={field.value.includes(skill)} disabled={!field.value.includes(skill) && field.value.length >= 2} onClick={() => field.onChange(field.value.includes(skill) ? field.value.filter((item) => item !== skill) : [...field.value, skill])}>{skill.split('/')[0].trim()}</Choice>)}</div>} />{error('top_skills')}</div>
        <div><span className="label">O que procura em outra pessoa · até 3</span><Controller control={control} name="partner_needs" render={({ field }) => <div className="choice-row">{SKILL_OPTIONS.map((skill) => <Choice key={skill} selected={field.value.includes(skill)} disabled={!field.value.includes(skill) && field.value.length >= 3} onClick={() => field.onChange(field.value.includes(skill) ? field.value.filter((item) => item !== skill) : [...field.value, skill])}>{skill.split('/')[0].trim()}</Choice>)}</div>} />{error('partner_needs')}</div>
        <div><span className="label">Tempo disponível por semana</span><div className="choice-row">{HOURS.map((hours) => <Choice key={hours} selected={availability === hours} onClick={() => setValue('availability_hours', hours)}>{hours} horas</Choice>)}</div></div>
      </div>
    </section>}

    {show(3) && <section className="surface form-section">
      <h2>Pronto para conectar.</h2>
      <p className="muted" style={{ marginBottom: 24 }}>Seu curso, matérias e interesses ajudam outras pessoas a encontrar você. WhatsApp e e-mail só aparecem após uma conexão aceita.</p>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13, lineHeight: 1.6 }}><input type="checkbox" style={{ marginTop: 4, accentColor: 'var(--blue)' }} {...register('consent_lgpd')} /><span>Concordo em compartilhar meus dados acadêmicos no Connect FAESA para encontrar outros estudantes e autorizo o uso dos dados de contato após uma conexão aceita.</span></label>{error('consent_lgpd')}
      <div style={{ marginTop: 22 }}><label className="label" htmlFor="about">Algo mais sobre você? <span className="muted" style={{ fontWeight: 400 }}>(opcional)</span></label><textarea id="about" className="field" rows={3} placeholder="Conte sobre interesses, projetos ou seu jeito de estudar" {...register('feedback')} /></div>
    </section>}

    {isEdit ? <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><button type="button" className="btn btn-quiet" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Salvando...' : 'Salvar alterações'} <Check size={17} /></button></div> : <div className="wizard-actions"><button type="button" className="btn btn-quiet" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft size={16} /> Voltar</button>{step < 3 ? <button type="button" className="btn btn-primary" onClick={nextStep}>Continuar <ArrowRight size={16} /></button> : <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Salvando...' : 'Concluir perfil'} <ArrowRight size={16} /></button>}</div>}
  </form>

  if (isEdit) return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.() }}><div className="surface modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title"><div className="modal-top" style={{ marginBottom: 24 }}><div><p className="eyebrow">Meu espaço</p><h2 id="edit-profile-title" className="display" style={{ fontSize: 34, marginTop: 8 }}>Editar perfil</h2></div><button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label="Fechar edição"><X size={20} /></button></div>{form}</div></div>

  return <div className="wizard"><aside className="type-stage wizard-aside"><TypeRepeater /><div style={{ position: 'relative', zIndex: 2 }}><p className="eyebrow" style={{ color: '#c9d9ff' }}>Connect FAESA</p><h1 className="display">Um perfil. Muitas <span className="script">possibilidades.</span></h1></div><p style={{ position: 'relative', zIndex: 2, color: '#d3dff8', fontSize: 13 }}>Seus dados de contato ficam privados até você aceitar uma conexão.</p></aside><div className="wizard-main"><div className="wizard-main-inner"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span className="step-progress">Etapa {step + 1} de 4</span><Link href="/" className="muted" style={{ fontSize: 12, fontWeight: 700 }}>Connect FAESA</Link></div><div className="step-bar" aria-hidden="true">{[0, 1, 2, 3].map((item) => <span key={item} className={item <= step ? 'done' : ''} />)}</div><h2 className="display">Vamos encontrar sua turma.</h2><p className="muted" style={{ marginBottom: 28 }}>Leva só alguns minutos. Você pode editar tudo depois.</p>{form}</div></div></div>
}
