import { z } from 'zod'
import { findCourse, subjectsFor } from '@/lib/catalog'

export const GOALS = ['Grupo de Estudos', 'TCC', 'Startup', 'Extracurricular', 'Outros'] as const
export const SHIFTS = ['Matutino', 'Vespertino', 'Noturno', 'EAD'] as const
export const HOURS = ['1 a 3', '4 a 7', 'Mais de 8'] as const

export const SKILL_OPTIONS = [
  'Tecnologia / Programação / Dados',
  'Negócios / Gestão / Finanças',
  'Engenharia / Projetos Físicos / Hardware',
  'Saúde / Bem-Estar / Biológicas',
  'Design / Criatividade / Espaços',
  'Comunicação / Marketing / Mídia',
  'Jurídico / Leis / Contratos',
] as const

export const SKILL_QUESTIONS: Record<string, string> = {
  'Tecnologia / Programação / Dados': 'Quais linguagens ou tecnologias você domina?',
  'Negócios / Gestão / Finanças': 'Qual sua especialidade?',
  'Engenharia / Projetos Físicos / Hardware': 'Em qual tipo de projeto você tem mais facilidade?',
  'Saúde / Bem-Estar / Biológicas': 'Qual o seu foco de pesquisa ou atuação?',
  'Design / Criatividade / Espaços': 'Quais softwares ou métodos você usa?',
  'Comunicação / Marketing / Mídia': 'Qual sua maior habilidade?',
  'Jurídico / Leis / Contratos': 'Qual área do Direito você conhece melhor?',
}

export const onboardingSchema = z.object({
  full_name: z.string().trim().min(3, 'Informe seu nome completo.'),
  whatsapp: z.string().trim().min(10, 'Informe seu WhatsApp com DDD.'),
  institutional_email: z.email('Informe um e-mail válido.').refine(
    (email) => /@(aluno\.)?faesa\.br$/i.test(email),
    'Use seu e-mail institucional da FAESA.',
  ),
  modality: z.enum(['Presencial', 'EAD']),
  course: z.string().min(1, 'Escolha seu curso.'),
  shift: z.enum(SHIFTS),
  study_subjects: z.array(z.string()).max(8, 'Escolha até 8 matérias.'),
  main_goal: z.enum(GOALS),
  specific_goal: z.string().max(240).optional(),
  top_skills: z.array(z.string()).min(1, 'Escolha pelo menos uma habilidade.').max(2),
  specific_skills: z.record(z.string(), z.string()).optional(),
  partner_needs: z.array(z.string()).min(1, 'Escolha pelo menos uma habilidade que procura.').max(3),
  availability_hours: z.enum(HOURS),
  consent_lgpd: z.boolean().refine(Boolean, 'É preciso aceitar os termos de privacidade.'),
  feedback: z.string().max(500).optional(),
}).superRefine((data, ctx) => {
  const course = findCourse(data.modality, data.course)
  if (!course) {
    ctx.addIssue({ code: 'custom', path: ['course'], message: 'Escolha um curso da FAESA.' })
    return
  }
  if (data.modality === 'EAD' && data.shift !== 'EAD') {
    ctx.addIssue({ code: 'custom', path: ['shift'], message: 'Selecione o turno EAD.' })
  }
  if (data.modality === 'Presencial' && data.shift === 'EAD') {
    ctx.addIssue({ code: 'custom', path: ['shift'], message: 'Selecione um turno presencial.' })
  }
  const available = new Set(subjectsFor(data.modality, data.course))
  if (data.study_subjects.some((subject) => !available.has(subject))) {
    ctx.addIssue({ code: 'custom', path: ['study_subjects'], message: 'Escolha matérias da grade do seu curso.' })
  }
})

export type OnboardingData = z.infer<typeof onboardingSchema>
