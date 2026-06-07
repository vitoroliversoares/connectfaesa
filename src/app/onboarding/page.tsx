'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { getUserAction } from '@/actions/auth'
import { updateProfileAction } from '@/actions/profile'
import { Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { 
  onboardingSchema, 
  OnboardingData, 
  SKILL_OPTIONS, 
  SKILL_QUESTIONS 
} from '@/lib/validations/onboarding'

const COURSES = onboardingSchema.shape.course.options
const SHIFTS = onboardingSchema.shape.shift.options
const HOURS = onboardingSchema.shape.availability_hours.options

const WELCOME_CARDS = [
  { id: 'TCC', title: 'Parceiro de TCC', desc: 'Filtre por curso e interesses para achar o par ideal.', icon: '🎓' },
  { id: 'Grupo de Estudos', title: 'Grupos de Estudo', desc: 'Junte-se a colegas para mandar bem nas disciplinas.', icon: '📚' },
  { id: 'Startup', title: 'Startup Co-founders', desc: 'Tem uma ideia? Encontre alunos de TI, Negócios e Design.', icon: '🚀' },
  { id: 'Extracurricular', title: 'Projeto Personalizado', desc: 'Iniciação científica, projetos de extensão ou outros.', icon: '🧩' },
]

export default function OnboardingWizard() {
  const [step, setStep] = useState(0) // Começa no passo 0 (Welcome Screen)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const router = useRouter()

  const { register, handleSubmit, control, watch, setValue, trigger, formState: { errors } } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      top_skills: [],
      partner_needs: [],
      specific_skills: {}
    }
  })

  useEffect(() => {
    async function init() {
      const user = await getUserAction()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)
      setValue('institutional_email', user.email || '')
      setLoading(false)
    }
    init()
  }, [router, setValue])

  const nextStep = async () => {
    let fieldsToValidate: any[] = []
    
    // Novo mapeamento de passos:
    // Passo 1: Básicos
    // Passo 2: Acadêmico
    // Passo 3: Oferece (top_skills)
    // Passo 4: Busca (partner_needs)
    // Passo 5: Termos/Feedback
    
    if (step === 1) fieldsToValidate = ['full_name', 'whatsapp', 'institutional_email']
    if (step === 2) fieldsToValidate = ['course', 'shift']
    if (step === 3) fieldsToValidate = ['top_skills', 'specific_skills']
    if (step === 4) fieldsToValidate = ['partner_needs', 'availability_hours']
    
    const isValid = await trigger(fieldsToValidate)
    
    if (isValid) {
      setStep(s => Math.min(s + 1, 5))
    }
  }

  const prevStep = () => {
    setStep(s => Math.max(s - 1, 1)) // Não permite voltar pro passo 0 via botão Voltar padrão
  }

  const onSubmit = async (data: OnboardingData) => {
    if (!userId) return
    setSubmitting(true)

    const result = await updateProfileAction(data)

    if (result.error) {
      toast.error('Erro ao salvar perfil', { description: result.error })
      setSubmitting(false)
    } else {
      toast.success('Perfil concluído com sucesso!')
      router.push('/dashboard')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Carregando...</div>

  const topSkillsWatch = watch('top_skills')
  const partnerNeedsWatch = watch('partner_needs')

  // Renderização da Tela de Boas Vindas (Passo 0)
  if (step === 0) {
    return (
      <div className="min-h-screen bg-faesa-blue text-white flex flex-col justify-center items-center px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto w-full"
        >
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <Image src="/logo.png" alt="Logo FAESA" width={300} height={80} priority className="h-16 md:h-20 w-auto" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Bem-vindo(a) ao ConnectFAESA!</h1>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">Para começarmos a construir o seu perfil e encontrar as pessoas certas, qual é o seu objetivo principal na plataforma?</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WELCOME_CARDS.map(card => (
              <button 
                key={card.id}
                type="button"
                onClick={() => {
                  setValue('main_goal', card.id as any)
                  setStep(1)
                }}
                className="bg-white rounded-3xl p-8 text-left shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all duration-300 flex flex-col h-full border-b-4 border-transparent hover:border-blue-400 group focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <div className="text-4xl mb-6 bg-blue-50 w-20 h-20 flex items-center justify-center rounded-2xl group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300 shadow-sm">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Renderização do Wizard (Passos 1 a 5)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-12 pb-24 px-4">
      <div className="max-w-2xl mx-auto w-full">
        {/* Progress Bar (Passos 1 ao 5) */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 px-1">
            <button 
              type="button"
              onClick={() => setStep(0)} 
              className="text-sm font-medium text-faesa-blue hover:underline"
            >
              Trocar Objetivo
            </button>
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-gray-500">Passo {step} de 5</span>
              <span className="text-xs font-medium text-gray-400">{Math.round((step / 5) * 100)}% concluído</span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-faesa-blue"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative min-h-[500px]">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-10 h-full flex flex-col">
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Informações Básicas</h2>
                    <p className="text-gray-500 mt-1">Como devemos te chamar?</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo (ou Nome Social)</label>
                    <input {...register('full_name')} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-faesa-blue outline-none text-slate-900 placeholder:text-slate-400" placeholder="Ex: João Silva" />
                    {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                    <input {...register('whatsapp')} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-faesa-blue outline-none text-slate-900 placeholder:text-slate-400" placeholder="(27) 99999-9999" />
                    {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail Institucional</label>
                    <input {...register('institutional_email')} disabled className="w-full p-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dados Acadêmicos</h2>
                    <p className="text-gray-500 mt-1">Conte-nos sobre os seus estudos.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Qual curso você faz?</label>
                    <select {...register('course')} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-faesa-blue outline-none appearance-none text-slate-900">
                      <option className="text-slate-900 bg-white" value="">Selecione um curso...</option>
                      {COURSES.map(c => <option className="text-slate-900 bg-white" key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.course && <p className="text-red-500 text-sm mt-1">{errors.course.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Qual o seu turno?</label>
                    <Controller
                      name="shift"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-3 gap-3">
                          {SHIFTS.map(s => (
                            <label key={s} className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${field.value === s ? 'border-faesa-blue bg-blue-50 text-faesa-blue font-semibold' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}>
                              <input type="radio" className="hidden" {...field} value={s} checked={field.value === s} />
                              {s}
                            </label>
                          ))}
                        </div>
                      )}
                    />
                    {errors.shift && <p className="text-red-500 text-sm mt-1">{errors.shift.message}</p>}
                  </div>
                </motion.div>
              )}

              {/* Note: O antigo Step 3 (Objetivo) foi deletado aqui */}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">O que você oferece?</h2>
                    <p className="text-gray-500 mt-1">Selecione até 2 habilidades principais.</p>
                  </div>

                  <div>
                    <Controller
                      name="top_skills"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SKILL_OPTIONS.map(skill => {
                            const isSelected = field.value.includes(skill)
                            const isDisabled = !isSelected && field.value.length >= 2
                            
                            return (
                              <label key={skill} className={`cursor-pointer rounded-xl border-2 p-4 transition-all flex items-start ${isSelected ? 'border-faesa-blue bg-blue-50 text-faesa-blue font-medium' : isDisabled ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-100 hover:border-gray-200 text-gray-700'}`}>
                                <input 
                                  type="checkbox" 
                                  className="hidden" 
                                  disabled={isDisabled}
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      field.onChange([...field.value, skill])
                                    } else {
                                      field.onChange(field.value.filter(v => v !== skill))
                                      setValue(`specific_skills.${skill}`, '')
                                    }
                                  }} 
                                />
                                <div className={`w-5 h-5 rounded border-2 mt-0.5 mr-3 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-faesa-blue bg-faesa-blue text-white' : 'border-gray-300 bg-white'}`}>
                                  {isSelected && <Check size={14} />}
                                </div>
                                <span className="text-sm">{skill}</span>
                              </label>
                            )
                          })}
                        </div>
                      )}
                    />
                    {errors.top_skills && <p className="text-red-500 text-sm mt-2 font-medium">{errors.top_skills.message}</p>}
                  </div>

                  {topSkillsWatch.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 pt-4 border-t border-gray-100">
                      <h3 className="font-medium text-gray-900">Detalhe suas habilidades selecionadas:</h3>
                      {topSkillsWatch.map(skill => (
                        <div key={skill}>
                          <label className="block text-sm text-gray-600 mb-1">{SKILL_QUESTIONS[skill]}</label>
                          <input {...register(`specific_skills.${skill}`)} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-faesa-blue outline-none text-slate-900 placeholder:text-slate-400" />
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">O que você busca?</h2>
                    <p className="text-gray-500 mt-1">Selecione até 3 necessidades no parceiro ideal.</p>
                  </div>

                  <div>
                    <Controller
                      name="partner_needs"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {SKILL_OPTIONS.map(skill => {
                            const isSelected = field.value.includes(skill)
                            const isDisabled = !isSelected && field.value.length >= 3
                            
                            return (
                              <label key={skill} className={`cursor-pointer rounded-xl border-2 p-3 transition-all flex items-start ${isSelected ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium' : isDisabled ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-100 hover:border-gray-200 text-gray-700'}`}>
                                <input 
                                  type="checkbox" 
                                  className="hidden" 
                                  disabled={isDisabled}
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) field.onChange([...field.value, skill])
                                    else field.onChange(field.value.filter(v => v !== skill))
                                  }} 
                                />
                                <div className={`w-5 h-5 rounded border-2 mt-0.5 mr-3 flex-shrink-0 flex items-center justify-center ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 bg-white'}`}>
                                  {isSelected && <Check size={14} />}
                                </div>
                                <span className="text-sm">{skill}</span>
                              </label>
                            )
                          })}
                        </div>
                      )}
                    />
                    {errors.partner_needs && <p className="text-red-500 text-sm mt-2 font-medium">{errors.partner_needs.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Sua disponibilidade (Horas/Semana)</label>
                    <Controller
                      name="availability_hours"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-3 gap-3">
                          {HOURS.map(h => (
                            <label key={h} className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all text-sm ${field.value === h ? 'border-faesa-blue bg-blue-50 text-faesa-blue font-semibold' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}>
                              <input type="radio" className="hidden" {...field} value={h} checked={field.value === h} />
                              {h}
                            </label>
                          ))}
                        </div>
                      )}
                    />
                    {errors.availability_hours && <p className="text-red-500 text-sm mt-1">{errors.availability_hours.message}</p>}
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-grow space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Quase lá!</h2>
                    <p className="text-gray-500 mt-1">Conclua seu perfil para começar a conectar.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quer detalhar melhor sua ideia ou projeto? (Opcional)</label>
                    <textarea {...register('specific_goal')} rows={3} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-faesa-blue outline-none resize-none text-slate-900 placeholder:text-slate-400" placeholder="Ex: Procuro alguém que saiba programar em Python para minha ideia de App..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Algum detalhe a mais sobre você? (Opcional)</label>
                    <textarea {...register('feedback')} rows={4} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-faesa-blue outline-none resize-none text-slate-900 placeholder:text-slate-400" placeholder="Fique à vontade para escrever mais sobre sua personalidade, interesses ou como gosta de trabalhar..." />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="flex items-start cursor-pointer">
                      <input type="checkbox" {...register('consent_lgpd')} className="mt-1 w-5 h-5 rounded text-faesa-blue focus:ring-faesa-blue" />
                      <span className="ml-3 text-sm text-gray-600">
                        Concordo em compartilhar meus dados com outros alunos da FAESA na plataforma para fins acadêmicos e profissionais, conforme os termos de privacidade.
                      </span>
                    </label>
                    {errors.consent_lgpd && <p className="text-red-500 text-sm mt-2 ml-8 font-medium">{errors.consent_lgpd.message}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="flex items-center text-gray-500 hover:text-gray-900 font-medium px-4 py-2 transition-colors">
                  <ChevronLeft size={20} className="mr-1" />
                  Voltar
                </button>
              ) : (
                <div />
              )}
              
              {step < 5 ? (
                <button type="button" onClick={nextStep} className="flex items-center bg-faesa-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-faesa-light transition-colors shadow-sm">
                  Continuar
                  <ChevronRight size={20} className="ml-1" />
                </button>
              ) : (
                <button type="submit" disabled={submitting} className="flex items-center bg-green-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors shadow-md disabled:opacity-50">
                  {submitting ? 'Salvando...' : 'Concluir Perfil'}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
