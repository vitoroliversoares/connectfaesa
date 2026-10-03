'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CampusArtifact } from './CampusArtifact'

const moments = [
  {
    eyebrow: 'Ideias em movimento',
    heading: <>Toda grande ideia começa com um <span className="script">encontro.</span></>,
    description: 'Entre livros e conversas, uma matéria em comum pode virar uma parceria. Encontre quem compartilha o que você está estudando.',
  },
  {
    eyebrow: 'Matérias em comum',
    heading: <>Estudar junto abre novos <span className="script">caminhos.</span></>,
    description: 'Escolha as disciplinas que está cursando e descubra colegas da FAESA que vivem os mesmos desafios e querem trocar ideias.',
  },
  {
    eyebrow: 'Conexões no seu ritmo',
    heading: <>Uma conversa pode ser o início do <span className="script">próximo projeto.</span></>,
    description: 'Explore perfis, envie um convite e comece a conversar quando a outra pessoa aceitar. O seu contato continua privado até lá.',
  },
] as const

export function ArtifactStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeMoment, setActiveMoment] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = section.getBoundingClientRect()
      const travel = Math.max(1, rect.height - window.innerHeight)
      const progress = Math.max(0, Math.min(1, -rect.top / travel))
      setActiveMoment(progress < 0.34 ? 0 : progress < 0.68 ? 1 : 2)
    }
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(section)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    scheduleUpdate()

    return () => {
      if (frame) cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [])

  const moment = moments[activeMoment]

  return <section className="artifact-section" aria-labelledby="artifact-title" ref={sectionRef}>
    <div className="shell artifact-layout">
      <div className="artifact-copy">
        <div className="artifact-copy-stage" data-moment={activeMoment + 1}>
          <div className="artifact-moment" key={activeMoment}>
            <p className="eyebrow">{moment.eyebrow}</p>
            <h2 className="display" id="artifact-title">{moment.heading}</h2>
            <p>{moment.description}</p>
          </div>
        </div>
        <div className="artifact-copy-footer">
          <Link href="/login?mode=register" className="text-link">Encontre sua turma <ArrowRight size={18} /></Link>
          <div className="artifact-progress" aria-label={`Parte ${activeMoment + 1} de ${moments.length}`}>
            <span>{String(activeMoment + 1).padStart(2, '0')} <span className="artifact-progress-total">/ 0{moments.length}</span></span>
            <span className="artifact-progress-track" aria-hidden="true"><span style={{ width: `${((activeMoment + 1) / moments.length) * 100}%` }} /></span>
          </div>
        </div>
      </div>
      <CampusArtifact />
    </div>
  </section>
}
