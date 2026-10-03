import { sharedSubjects } from '@/lib/catalog'

type MatchProfile = {
  course?: string | null
  shift?: string | null
  study_subjects?: string[] | null
  top_skills?: string[] | null
  partner_needs?: string[] | null
}

export function calculateMatchScore(user: MatchProfile | null, other: MatchProfile | null) {
  if (!user || !other) return { score: 0, reasons: [] as string[], subjects: [] as string[] }
  let score = 0
  const reasons: string[] = []
  const subjects = sharedSubjects(user.study_subjects, other.study_subjects)
  if (subjects.length) {
    score += Math.min(subjects.length * 20, 50)
    reasons.push(`${subjects.length} ${subjects.length === 1 ? 'matéria em comum' : 'matérias em comum'}`)
  }
  const offered = user.partner_needs?.filter((skill) => other.top_skills?.includes(skill)) ?? []
  if (offered.length) { score += Math.min(offered.length * 15, 25); reasons.push('Oferece uma habilidade que você procura') }
  const reciprocal = other.partner_needs?.filter((skill) => user.top_skills?.includes(skill)) ?? []
  if (reciprocal.length) { score += Math.min(reciprocal.length * 10, 15); reasons.push('Procura uma habilidade que você oferece') }
  if (user.course && user.course === other.course) { score += 10; reasons.push('Mesmo curso') }
  if (user.shift && user.shift === other.shift) { score += 5; reasons.push('Mesmo turno') }
  return { score: Math.min(score, 100), reasons, subjects }
}
