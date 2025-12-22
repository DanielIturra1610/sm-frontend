'use client'

import * as React from 'react'
import { useState, useRef, useEffect, forwardRef, useCallback, useImperativeHandle, useMemo } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'
import { useSuggestions } from '@/shared/hooks/suggestion-hooks'
import { History, ChevronDown } from 'lucide-react'

export interface SuggestionInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  suggestionType: 'responsables' | 'clientes'
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  name?: string
}

/**
 * Input with suggestion dropdown for responsables and clientes
 * Shows historical values used in previous reports
 * Compatible with react-hook-form register()
 */
export const SuggestionInput = forwardRef<HTMLInputElement, SuggestionInputProps>(
  ({ suggestionType, onChange, onBlur, onFocus, className, value, defaultValue, name, ...props }, forwardedRef) => {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Forward the ref to the input
    useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement)

    // Fetch suggestions from backend
    const { data: suggestions = [], isLoading } = useSuggestions(suggestionType, {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    })

    // Sync value prop with internal state (for controlled mode)
    useEffect(() => {
      if (value !== undefined && value !== null) {
        setInputValue(String(value))
      }
    }, [value])

    // Initialize with defaultValue
    useEffect(() => {
      if (defaultValue !== undefined && defaultValue !== null && !value) {
        setInputValue(String(defaultValue))
      }
    }, [defaultValue, value])

    // Filter suggestions based on input - use useMemo to avoid infinite loops
    const filteredSuggestions = useMemo(() => {
      if (!inputValue?.trim()) {
        return suggestions.slice(0, 10)
      }
      return suggestions
        .filter((s) =>
          s.toLowerCase().includes(inputValue.toLowerCase())
        )
        .slice(0, 10)
    }, [inputValue, suggestions])

    // Handle click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      onChange?.(e)
      if (suggestions.length > 0) {
        setIsOpen(true)
      }
    }, [onChange, suggestions.length])

    const handleInputFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      if (suggestions.length > 0) {
        setIsOpen(true)
      }
      onFocus?.(e)
    }, [suggestions.length, onFocus])

    const handleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      // Delay to allow click on suggestion
      setTimeout(() => {
        setIsOpen(false)
      }, 150)
      onBlur?.(e)
    }, [onBlur])

    const handleSuggestionClick = useCallback((suggestion: string) => {
      setInputValue(suggestion)
      if (inputRef.current) {
        // Set the value on the native input
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set
        nativeInputValueSetter?.call(inputRef.current, suggestion)

        // Dispatch native input event to trigger react-hook-form
        const inputEvent = new Event('input', { bubbles: true })
        inputRef.current.dispatchEvent(inputEvent)

        // Also dispatch change event
        const changeEvent = new Event('change', { bubbles: true })
        inputRef.current.dispatchEvent(changeEvent)
      }
      setIsOpen(false)
    }, [])

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      } else if (e.key === 'ArrowDown' && !isOpen && suggestions.length > 0) {
        setIsOpen(true)
      }
    }, [isOpen, suggestions.length])

    return (
      <div className="relative">
        <div className="relative">
          <Input
            ref={inputRef}
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className={cn('pr-8', className)}
            {...props}
          />
          {suggestions.length > 0 && (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
              tabIndex={-1}
            >
              <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && filteredSuggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
          >
            <div className="px-2 py-1.5 text-xs text-gray-500 border-b flex items-center gap-1">
              <History className="h-3 w-3" />
              Historial de {suggestionType === 'responsables' ? 'responsables' : 'clientes'}
            </div>
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">Cargando...</div>
            ) : (
              <ul className="py-1">
                {filteredSuggestions.map((suggestion, index) => (
                  <li key={`${suggestion}-${index}`}>
                    <button
                      type="button"
                      className={cn(
                        'w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                        suggestion.toLowerCase() === inputValue?.toLowerCase() && 'bg-gray-50 font-medium'
                      )}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    )
  }
)

SuggestionInput.displayName = 'SuggestionInput'
