import { z } from 'zod'

export const onboardingSchema = z.object({
  full_name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  whatsapp: z.string().min(10, 'Digite um WhatsApp válido com DDD'),
  institutional_email: z.string().email(),
  course: z.enum([
    'Administração', 
    'Arquitetura e Urbanismo', 
    'Ciências Contábeis', 
    'Design Gráfico', 
    'Enfermagem', 
    'Engenharia da Computação', 
    'Engenharia Elétrica', 
    'Jornalismo', 
    'Odontologia', 
    'Psicologia', 
    'Sistemas de Informação', 
    'Análise e Desenvolvimento de Sistemas (ADS)', 
    'Ciência da Computação', 
    'Design de Moda'
  ]),
  shift: z.enum(['Matutino', 'Vespertino', 'Noturno']),
  main_goal: z.enum(['TCC', 'Startup', 'Grupo de Estudos', 'Extracurricular', 'Outros']),
  specific_goal: z.string().optional(),
  top_skills: z.array(z.string()).min(1, 'Selecione pelo menos 1 habilidade').max(2, 'Selecione no máximo 2 habilidades'),
  specific_skills: z.record(z.string(), z.string()).optional(),
  partner_needs: z.array(z.string()).min(1, 'Selecione pelo menos 1 necessidade').max(3, 'Selecione no máximo 3 necessidades'),
  availability_hours: z.enum(['1 a 3', '4 a 7', 'Mais de 8']),
  consent_lgpd: z.boolean().refine(val => val === true, 'Você precisa aceitar os termos de privacidade'),
  feedback: z.string().optional(),
})

export type OnboardingData = z.infer<typeof onboardingSchema>

export const SKILL_OPTIONS = [
  'Tecnologia / Programação / Dados',
  'Negócios / Gestão / Finanças',
  'Engenharia / Projetos Físicos / Hardware',
  'Saúde / Bem-Estar / Biológicas',
  'Design / Criatividade / Espaços',
  'Comunicação / Marketing / Mídia',
  'Jurídico / Leis / Contratos'
]

export const SKILL_QUESTIONS: Record<string, string> = {
  'Tecnologia / Programação / Dados': 'Quais linguagens ou tecnologias você domina?',
  'Negócios / Gestão / Finanças': 'Qual sua especialidade? (Ex: Vendas, Gestão de Pessoas)',
  'Engenharia / Projetos Físicos / Hardware': 'Em qual tipo de projeto você tem mais facilidade?',
  'Saúde / Bem-Estar / Biológicas': 'Qual o seu foco de pesquisa ou atuação?',
  'Design / Criatividade / Espaços': 'Quais softwares ou métodos você usa? (Ex: Figma, AutoCAD)',
  'Comunicação / Marketing / Mídia': 'Qual sua maior habilidade? (Ex: Redação, Edição de Vídeo)',
  'Jurídico / Leis / Contratos': 'Qual área do Direito você tem mais afinidade?'
}
