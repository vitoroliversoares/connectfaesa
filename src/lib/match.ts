// Algoritmo de Match Score Inteligente com Explicação das Afinidades
export function calculateMatchScore(user: any, other: any) {
  let score = 0
  const reasons: string[] = []

  if (!user || !other) {
    return { score: 0, reasons: [] }
  }

  // 1. Minhas necessidades no parceiro x habilidades que o outro oferece
  if (user.partner_needs && other.top_skills) {
    const matchingNeeds = user.partner_needs.filter((need: string) => other.top_skills.includes(need))
    if (matchingNeeds.length > 0) {
      score += matchingNeeds.length * 35 // Até 70%
      matchingNeeds.forEach((need: string) => {
        reasons.push(`Oferece a habilidade "${need.split('/')[0].trim()}" que você busca (+35%)`)
      })
    }
  }

  // 2. Necessidades do parceiro no outro x habilidades que eu ofereço
  if (other.partner_needs && user.top_skills) {
    const matchingOffers = other.partner_needs.filter((need: string) => user.top_skills.includes(need))
    if (matchingOffers.length > 0) {
      score += matchingOffers.length * 20 // Até 40%
      matchingOffers.forEach((need: string) => {
        reasons.push(`Busca a habilidade "${need.split('/')[0].trim()}" que você oferece (+20%)`)
      })
    }
  }

  // 3. Mesmos cursos (afinidade acadêmica)
  if (user.course === other.course) {
    score += 10
    reasons.push(`Estudam no mesmo curso: ${user.course} (+10%)`)
  }

  // 4. Mesmo turno (compatibilidade de horários)
  if (user.shift === other.shift) {
    score += 10
    reasons.push(`Estudam no mesmo turno: ${user.shift} (+10%)`)
  }

  if (score === 0) {
    reasons.push("Nenhuma afinidade direta encontrada nas habilidades principais ou curso/turno.")
  }

  return {
    score: Math.min(score, 100),
    reasons
  }
}
