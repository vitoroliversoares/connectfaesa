'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { X, Check } from 'lucide-react'
import { 
  onboardingSchema, 
  OnboardingData, 
  SKILL_OPTIONS, 
  SKILL_QUESTIONS 
} from '@/lib/validations/onboarding'

const COURSES = onboardingSchema.shape.course.options
const SHIFTS = onboardingSchema.shape.shift.options
const GOALS = onboardingSchema.shape.main_goal.options
const HOURS = onboardingSchema.shape.availability_hours.options

export default function EditProfileModal({ profile, onClose, onSave }: { profile: any, onClose: () => void, onSave: (p: any) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  // Mapeamos os valores atuais para o RHF (ignoramos consent_lgpd pois já foi aceito)
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      whatsapp: profile.whatsapp || '',
      institutional_email: profile.institutional_email || '',
      course: profile.course || '',
      shift: profile.shift || '',
      main_goal: profile.main_goal || '',
      specific_goal: profile.specific_goal || '',
      top_skills: profile.top_skills || [],
      specific_skills: profile.specific_skills || {},
      partner_needs: profile.partner_needs || [],
      availability_hours: profile.availability_hours || '',
      consent_lgpd: true, // Já aceitou
      feedback: profile.feedback || ''
    }
  })

  const topSkillsWatch = watch('top_skills')

  const onSubmit = async (data: OnboardingData) => {
    setIsSubmitting(true)
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', profile.id)

    if (error) {
      toast.error('Erro ao salvar', { description: error.message })
      setIsSubmitting(false)
    } else {
      toast.success('Perfil atualizado com sucesso!')
      onSave({ ...profile, ...data })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />
      
      <motion.div 
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full sm:max-w-2xl bg-white sm:rounded-2xl rounded-t-3xl shadow-xl overflow-hidden relative flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 flex-shrink-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">Editar Perfil</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow p-4 sm:p-6 bg-gray-50">
          <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-xl mx-auto pb-10">
            
            {/* Secão: Básico */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Dados Básicos</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input {...register('full_name')} className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-faesa-blue" />
                  {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input {...register('whatsapp')} className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-faesa-blue" />
                  {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp.message}</p>}
                </div>
              </div>
            </section>

            {/* Secão: Acadêmico */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Acadêmico</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                  <select {...register('course')} className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none text-slate-900 focus:ring-2 focus:ring-faesa-blue">
                    {COURSES.map(c => <option className="bg-white text-slate-900" key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.course && <p className="text-red-500 text-xs mt-1">{errors.course.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Turno</label>
                  <Controller
                    name="shift"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 gap-2">
                        {SHIFTS.map(s => (
                          <label key={s} className={`cursor-pointer rounded-xl border p-3 text-center text-sm transition-all ${field.value === s ? 'border-faesa-blue bg-blue-50 text-faesa-blue font-semibold' : 'border-gray-300 bg-white text-gray-700'}`}>
                            <input type="radio" className="hidden" {...field} value={s} checked={field.value === s} />
                            {s}
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Secão: Objetivos */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Objetivo</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo Principal</label>
                  <Controller
                    name="main_goal"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 gap-2">
                        {GOALS.map(g => (
                          <label key={g} className={`cursor-pointer rounded-xl border p-3 text-sm transition-all text-center ${field.value === g ? 'border-faesa-blue bg-blue-50 text-faesa-blue font-semibold' : 'border-gray-300 bg-white text-gray-700'}`}>
                            <input type="radio" className="hidden" {...field} value={g} checked={field.value === g} />
                            {g}
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Especifique (Opcional)</label>
                  <textarea {...register('specific_goal')} rows={2} className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-faesa-blue resize-none" />
                </div>
              </div>
            </section>

            {/* Secão: Habilidades (Oferece) */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Suas Habilidades (Max 2)</h3>
              <Controller
                name="top_skills"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-2">
                    {SKILL_OPTIONS.map(skill => {
                      const isSelected = field.value.includes(skill)
                      const isDisabled = !isSelected && field.value.length >= 2
                      return (
                        <label key={skill} className={`cursor-pointer rounded-xl border p-3 flex items-center ${isSelected ? 'border-faesa-blue bg-blue-50 text-faesa-blue' : isDisabled ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-300 bg-white text-gray-700'}`}>
                          <input type="checkbox" className="hidden" disabled={isDisabled} checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) field.onChange([...field.value, skill])
                              else {
                                field.onChange(field.value.filter(v => v !== skill))
                                setValue(`specific_skills.${skill}`, '')
                              }
                            }} 
                          />
                          <div className={`w-4 h-4 rounded mr-3 flex items-center justify-center border ${isSelected ? 'border-faesa-blue bg-faesa-blue text-white' : 'border-gray-400 bg-white'}`}>
                            {isSelected && <Check size={12} />}
                          </div>
                          <span className="text-sm font-medium">{skill.split('/')[0].trim()}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              />
              {errors.top_skills && <p className="text-red-500 text-xs mt-1">{errors.top_skills.message}</p>}
              
              {topSkillsWatch.length > 0 && (
                <div className="space-y-3 mt-4 p-4 bg-white border border-gray-200 rounded-xl">
                  <p className="text-sm font-bold text-gray-800">Detalhes:</p>
                  {topSkillsWatch.map(skill => (
                    <div key={skill}>
                      <label className="block text-xs text-gray-600 mb-1">{SKILL_QUESTIONS[skill]}</label>
                      <input {...register(`specific_skills.${skill}`)} className="w-full p-2 bg-white border border-gray-300 rounded-lg outline-none text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-faesa-blue text-sm" />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Secão: Buscas e Disponibilidade */}
            <section>
              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Busca e Disponibilidade</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Busca no parceiro (Max 3)</label>
                <Controller
                  name="partner_needs"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {SKILL_OPTIONS.map(skill => {
                        const isSelected = field.value.includes(skill)
                        const isDisabled = !isSelected && field.value.length >= 3
                        return (
                          <label key={skill} className={`cursor-pointer rounded-xl border p-2 flex items-center ${isSelected ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : isDisabled ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-300 bg-white text-gray-700'}`}>
                            <input type="checkbox" className="hidden" disabled={isDisabled} checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) field.onChange([...field.value, skill])
                                else field.onChange(field.value.filter(v => v !== skill))
                              }} 
                            />
                            <div className={`w-4 h-4 rounded mr-2 flex-shrink-0 flex items-center justify-center border ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-400 bg-white'}`}>
                              {isSelected && <Check size={12} />}
                            </div>
                            <span className="text-xs font-medium line-clamp-1">{skill.split('/')[0].trim()}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                />
                {errors.partner_needs && <p className="text-red-500 text-xs mt-1">{errors.partner_needs.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horas disponíveis por semana</label>
                <Controller
                  name="availability_hours"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-2">
                      {HOURS.map(h => (
                        <label key={h} className={`cursor-pointer rounded-xl border p-2 text-center text-sm transition-all ${field.value === h ? 'border-faesa-blue bg-blue-50 text-faesa-blue font-semibold' : 'border-gray-300 bg-white text-gray-700'}`}>
                          <input type="radio" className="hidden" {...field} value={h} checked={field.value === h} />
                          {h}
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>
            </section>

          </form>
        </div>

        <div className="p-4 sm:p-6 bg-white border-t border-gray-200 flex-shrink-0">
          <button 
            form="edit-profile-form"
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-faesa-blue hover:bg-faesa-light text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
