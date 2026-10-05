'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'

type Props = {
  label: string
  allLabel: string
  options: string[]
  selected: string[]
  onChange: (next: string[]) => void
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR')
}

export function MultiSelectFilter({ label, allLabel, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listId = useId()
  const summary = selected.length === 0 ? allLabel : selected.length === 1 ? selected[0] : `${selected.length} ${label.toLocaleLowerCase('pt-BR')}`
  const visibleOptions = options.filter((option) => normalize(option).includes(normalize(query.trim())))

  useEffect(() => {
    if (!open) return
    searchRef.current?.focus()
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  function toggle(option: string) {
    onChange(selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])
  }

  return <div className="dashboard-filter" ref={rootRef} onKeyDown={(event) => {
    if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false); triggerRef.current?.focus() }
  }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
    <button ref={triggerRef} type="button" className="dashboard-filter-trigger" aria-label={`${label}: ${summary}`} aria-expanded={open} aria-controls={open ? listId : undefined} onClick={() => setOpen(!open)}>
      <span>{summary}</span><ChevronDown size={16} aria-hidden="true" />
    </button>
    {open && <div className="dashboard-filter-popover" id={listId}>
      <div className="dashboard-filter-head"><strong>{label}</strong>{selected.length > 0 && <button type="button" onClick={() => onChange([])}>Limpar</button>}</div>
      <div className="dashboard-filter-search"><Search size={15} aria-hidden="true" /><input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Buscar ${label.toLocaleLowerCase('pt-BR')}`} aria-label={`Buscar ${label.toLocaleLowerCase('pt-BR')}`} /></div>
      <div className="dashboard-filter-options" role="group" aria-label={`Selecionar ${label.toLocaleLowerCase('pt-BR')}`}>
        {visibleOptions.length ? visibleOptions.map((option) => <label className="dashboard-filter-option" key={option}><input type="checkbox" checked={selected.includes(option)} onChange={() => toggle(option)} /><span>{option}</span></label>) : <p className="dashboard-filter-empty">{options.length ? 'Nenhuma opção encontrada.' : 'Nenhuma opção disponível.'}</p>}
      </div>
    </div>}
  </div>
}
