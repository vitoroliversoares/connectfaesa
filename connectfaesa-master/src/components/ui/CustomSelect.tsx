'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | Option)[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = '',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Normalizar opções para { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt }
    }
    return opt
  })

  // Encontrar o label correspondente ao valor selecionado
  const selectedOption = normalizedOptions.find((opt) => opt.value === value)
  const displayLabel = selectedOption ? selectedOption.label : placeholder

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl flex items-center justify-between text-left text-gray-900 dark:text-zinc-100 font-medium transition-all focus:ring-2 focus:ring-faesa-blue focus:outline-none shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen ? 'ring-2 ring-faesa-blue border-transparent' : 'hover:border-gray-300 dark:hover:border-zinc-700'
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-250 flex-shrink-0 ml-2 ${
            isOpen ? 'transform rotate-180 text-faesa-blue dark:text-blue-400' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 mt-2 w-full bg-white/95 dark:bg-zinc-900/95 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1.5 focus:outline-none backdrop-blur-md"
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-zinc-400 italic">
                Nenhuma opção disponível
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between transition-colors font-semibold cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/20 text-faesa-blue dark:text-blue-400'
                        : 'text-gray-750 dark:text-zinc-300 hover:bg-gray-100/50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && (
                      <Check size={16} className="text-faesa-blue dark:text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
