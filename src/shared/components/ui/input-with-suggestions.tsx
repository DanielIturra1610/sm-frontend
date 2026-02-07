'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import { Check } from 'lucide-react'

export interface InputWithSuggestionsProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
  suggestions?: string[]
  onValueChange?: (value: string) => void
  value?: string | number | readonly string[]
}

const InputWithSuggestions = React.forwardRef<HTMLInputElement, InputWithSuggestionsProps>(
  ({ className, suggestions = [], onValueChange, onChange, onBlur, value, name, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState('')
    const containerRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const isInternalChange = React.useRef(false)

    // Sincronizar con value externo (de react-hook-form o controlado)
    React.useEffect(() => {
      if (!isInternalChange.current && value !== undefined && value !== null) {
        setInputValue(value.toString())
      }
      isInternalChange.current = false
    }, [value])

    // Filtrar sugerencias basadas en el valor actual
    const filteredSuggestions = React.useMemo(() => {
      if (!inputValue.trim()) return suggestions.slice(0, 5)
      const lowerValue = inputValue.toLowerCase()
      return suggestions
        .filter(s => s.toLowerCase().includes(lowerValue) && s.toLowerCase() !== lowerValue)
        .slice(0, 5)
    }, [inputValue, suggestions])

    // Cerrar al hacer clic fuera
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      isInternalChange.current = true
      setInputValue(newValue)
      setIsOpen(true)
      onChange?.(e)
      onValueChange?.(newValue)
    }

    const handleSelectSuggestion = (suggestion: string) => {
      isInternalChange.current = true
      setInputValue(suggestion)
      setIsOpen(false)
      onValueChange?.(suggestion)

      // Disparar evento de cambio para react-hook-form
      if (inputRef.current) {
        // Usar nativeInputValueSetter para cambiar el valor y disparar evento
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set
        nativeInputValueSetter?.call(inputRef.current, suggestion)

        // Disparar evento input para react-hook-form register
        const inputEvent = new Event('input', { bubbles: true })
        inputRef.current.dispatchEvent(inputEvent)

        // También disparar change para mayor compatibilidad
        const changeEvent = new Event('change', { bubbles: true })
        inputRef.current.dispatchEvent(changeEvent)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Delay para permitir click en sugerencias
      setTimeout(() => {
        setIsOpen(false)
      }, 150)
      onBlur?.(e)
    }

    // Combinar refs
    const combinedRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    const showSuggestions = isOpen && filteredSuggestions.length > 0

    return (
      <div ref={containerRef} className="relative">
        <Input
          ref={combinedRef}
          name={name}
          className={className}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          {...props}
        />
        {showSuggestions && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  'w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center justify-between',
                  suggestion === inputValue && 'bg-gray-50'
                )}
                onMouseDown={(e) => {
                  e.preventDefault() // Prevenir blur del input
                  handleSelectSuggestion(suggestion)
                }}
              >
                <span>{suggestion}</span>
                {suggestion === inputValue && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
)

InputWithSuggestions.displayName = 'InputWithSuggestions'

export { InputWithSuggestions }
