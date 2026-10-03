'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'

const photos = [
  { src: '/campus/movle.webp', title: 'Mov.le', detail: 'Espaços para criar e se reunir', alt: 'Espaço Mov.le da FAESA com mesas de estudo e cadeiras coloridas' },
  { src: '/campus/biblioteca.webp', title: 'Biblioteca', detail: 'Ideias entre as estantes', alt: 'Corredor da biblioteca FAESA entre estantes de livros' },
  { src: '/campus/nucleo-tecnologia.webp', title: 'Tecnologia', detail: 'Conhecimento em prática', alt: 'Fachada do Núcleo de Aplicações Tecnológicas da FAESA' },
  { src: '/campus/bloco-seis.webp', title: 'Bloco 6', detail: 'Pontos de encontro', alt: 'Área interna do Bloco 6 com mesas de convivência' },
  { src: '/campus/odontologia.webp', title: 'Odontologia', detail: 'Aprender fazendo', alt: 'Entrada envidraçada da Clínica Odontológica da FAESA' },
  { src: '/campus/sala-de-apoio.webp', title: 'Acolhimento', detail: 'Espaço para conversar', alt: 'Sala de apoio com cadeiras organizadas em círculo' },
  { src: '/campus/laboratorio-veterinaria.webp', title: 'Laboratórios', detail: 'Experimentar e descobrir', alt: 'Laboratório de Medicina Veterinária da FAESA' },
  { src: '/campus/convivencia.webp', title: 'Convivência', detail: 'O campus também acontece aqui', alt: 'Amplo espaço de convivência da FAESA com mesas e cadeiras' },
  { src: '/campus/sala-de-aula.webp', title: 'Salas de aula', detail: 'Onde tudo começa', alt: 'Sala de aula da FAESA com carteiras organizadas' },
] as const

const subscribeMotion = (onChange: () => void) => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
  preference.addEventListener('change', onChange)
  return () => preference.removeEventListener('change', onChange)
}
const getReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const getServerReducedMotion = () => false

export function CampusGallery() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const firstSetRef = useRef<HTMLDivElement>(null)
  const focusPause = useRef(false)
  const pointerFocus = useRef(false)
  const pauseUntil = useRef(0)
  const drag = useRef<{ x: number; scroll: number; pointerId: number } | null>(null)
  const activeRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, getServerReducedMotion)
  const motionPlaying = playing && !reducedMotion

  useEffect(() => {
    const viewport = viewportRef.current
    const first = firstSetRef.current
    if (!viewport || !first) return

    const onScroll = () => {
      const cycle = first.offsetWidth
      if (!cycle) return
      if (viewport.scrollLeft < cycle) {
        viewport.scrollLeft += cycle
        if (drag.current) drag.current.scroll += cycle
      } else if (viewport.scrollLeft >= cycle * 2) {
        viewport.scrollLeft -= cycle
        if (drag.current) drag.current.scroll -= cycle
      }

      const slide = first.querySelector<HTMLElement>('.gallery-slide')
      const gap = Number.parseFloat(getComputedStyle(first).columnGap) || 0
      const step = (slide?.offsetWidth ?? 0) + gap
      if (!step) return
      const next = ((Math.round((viewport.scrollLeft - cycle) / step) % photos.length) + photos.length) % photos.length
      if (activeRef.current !== next) {
        activeRef.current = next
        setActiveIndex(next)
      }
    }

    viewport.addEventListener('scroll', onScroll, { passive: true })
    viewport.scrollLeft = first.offsetWidth
    return () => viewport.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !motionPlaying) return
    let frame = 0
    let lastTime = 0

    const tick = (time: number) => {
      const delta = Math.min(time - (lastTime || time), 64)
      lastTime = time
      if (!drag.current && !focusPause.current && time > pauseUntil.current) viewport.scrollLeft += delta * 0.1
      frame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !frame) frame = requestAnimationFrame(tick)
      if (!entry.isIntersecting && frame) { cancelAnimationFrame(frame); frame = 0; lastTime = 0 }
    }, { threshold: 0.05 })
    observer.observe(viewport)
    return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame) }
  }, [motionPlaying])

  const move = (direction: -1 | 1) => {
    const viewport = viewportRef.current
    const first = firstSetRef.current
    const slide = first?.querySelector<HTMLElement>('.gallery-slide')
    if (!viewport || !first || !slide) return
    const gap = Number.parseFloat(getComputedStyle(first).columnGap) || 0
    pauseUntil.current = performance.now() + 6500
    viewport.scrollBy({ left: direction * (slide.offsetWidth + gap), behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return
    drag.current = null
    pauseUntil.current = performance.now() + 750
    event.currentTarget.removeAttribute('data-dragging')
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return
    pointerFocus.current = true
    focusPause.current = false
    drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft, pointerId: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.setAttribute('data-dragging', 'true')
  }

  const renderSet = (duplicate: boolean) => photos.map((photo, index) => <figure className={`gallery-slide${activeIndex === index ? ' is-active' : ''}`} key={`${photo.src}-${duplicate}`}>
    <div className="gallery-image"><Image src={photo.src} alt={duplicate ? '' : photo.alt} width={680} height={680} sizes="(max-width: 680px) 72vw, 330px" draggable={false} /></div>
  </figure>)

  const current = photos[activeIndex]
  return <section className="campus-gallery" aria-labelledby="gallery-title">
    <div className="shell gallery-heading">
      <p className="eyebrow">Vida no campus</p>
      <h2 className="display" id="gallery-title">O campus, em movimento.</h2>
      <p>Um olhar sobre os lugares onde encontros, estudos e projetos ganham vida.</p>
    </div>
    <div className="gallery-stage">
      <div className="gallery-viewport" ref={viewportRef} tabIndex={0} aria-label="Galeria de fotos do campus. Use as setas do teclado ou os controles para navegar." onFocusCapture={() => { if (!pointerFocus.current) focusPause.current = true }} onBlurCapture={() => { focusPause.current = false; pointerFocus.current = false }} onPointerDown={beginDrag} onPointerMove={(event) => { if (drag.current?.pointerId !== event.pointerId) return; event.currentTarget.scrollLeft = drag.current.scroll + drag.current.x - event.clientX }} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={(event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { pointerFocus.current = false; focusPause.current = true; event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1) } }}>
        <div className="gallery-track"><div className="gallery-set" ref={firstSetRef} aria-hidden="true">{renderSet(true)}</div><div className="gallery-set">{renderSet(false)}</div><div className="gallery-set" aria-hidden="true">{renderSet(true)}</div></div>
      </div>
    </div>
    <div className="shell gallery-footer">
      <div className="gallery-current" aria-live="off"><span>{String(activeIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span><strong>{current.title}</strong><p>{current.detail}</p></div>
      <div className="gallery-controls" aria-label="Controles da galeria">
        {!reducedMotion && <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pausar movimento da galeria' : 'Reproduzir movimento da galeria'} aria-pressed={!playing}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>}
        <button type="button" onClick={() => move(-1)} aria-label="Ver fotos anteriores"><ArrowLeft size={20} /></button>
        <button type="button" onClick={() => move(1)} aria-label="Ver próximas fotos"><ArrowRight size={20} /></button>
      </div>
    </div>
    <p className="shell gallery-credit">Fotos enviadas para o Connect FAESA · Arraste ou use as setas para explorar</p>
  </section>
}
