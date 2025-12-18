'use client'

import { forwardRef, useState } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'
import { formatRUT, validateRUT, getRUTErrorMessage } from '@/lib/utils/rut'

export interface RutInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  onValidation?: (isValid: boolean) => void
  showValidation?: boolean
}

const RutInput = forwardRef<HTMLInputElement, RutInputProps>(
  ({ value = '', onChange, onValidation, showValidation = true, className, ...props }, ref) => {
    const [isTouched, setIsTouched] = useState(false)
    
    const isValid = value ? validateRUT(value) : true
    const errorMessage = isTouched && showValidation && value ? getRUTErrorMessage(value) : null

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      
      // Allow only numbers, dots, hyphens, and K
      const cleanValue = inputValue.replace(/[^\dkK.-]/g, '')
      
      // Auto-format while typing
      const formatted = cleanValue.length > 1 ? formatRUT(cleanValue) : cleanValue
      
      if (onChange) {
        onChange(formatted)
      }
      
      if (onValidation) {
        onValidation(validateRUT(formatted))
      }
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsTouched(true)
      if (props.onBlur) {
        props.onBlur(e)
      }
    }

    return (
      <div className="space-y-1">
        <Input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="12.345.678-9"
          maxLength={12}
          className={cn(
            className,
            errorMessage && 'border-red-500 focus-visible:ring-red-500'
          )}
          {...props}
        />
        {errorMessage && (
          <p className="text-xs text-red-600">{errorMessage}</p>
        )}
        {!errorMessage && isTouched && value && isValid && showValidation && (
          <p className="text-xs text-green-600">✓ RUT válido</p>
        )}
        {!isTouched && (
          <p className="text-xs text-muted-foreground">Formato: XX.XXX.XXX-X</p>
        )}
      </div>
    )
  }
)

RutInput.displayName = 'RutInput'

export { RutInput }
