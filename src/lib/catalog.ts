import catalog from '@/data/faesa-catalog.json'

export type Modality = 'Presencial' | 'EAD'
export type Course = {
  name: string
  modality: Modality
  url: string
  periods: { label: string; subjects: string[] }[]
}

export const courses = catalog as Course[]

export function coursesFor(modality: Modality) {
  return courses.filter((course) => course.modality === modality)
}

export function findCourse(modality: Modality, name: string) {
  return courses.find((course) => course.modality === modality && course.name === name)
}

export function subjectsFor(modality: Modality, name: string) {
  const course = findCourse(modality, name)
  return course ? [...new Set(course.periods.flatMap((period) => period.subjects))] : []
}

export function sharedSubjects(a?: string[] | null, b?: string[] | null) {
  if (!a?.length || !b?.length) return []
  const names = new Set(a.map((subject) => subject.toLocaleLowerCase('pt-BR')))
  return b.filter((subject) => names.has(subject.toLocaleLowerCase('pt-BR')))
}
