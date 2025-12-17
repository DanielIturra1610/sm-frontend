import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

interface ValidationResult {
  name_exists: boolean
  rut_exists: boolean
}

interface UseCompanyValidationReturn {
  validateName: (name: string) => void
  validateRUT: (rut: string) => void
  nameExists: boolean | null
  rutExists: boolean | null
  isValidating: boolean
}

export function useCompanyValidation(): UseCompanyValidationReturn {
  const [nameExists, setNameExists] = useState<boolean | null>(null)
  const [rutExists, setRutExists] = useState<boolean | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateName = useCallback(async (name: string) => {
    if (!name || name.trim().length < 2) {
      setNameExists(null)
      return
    }

    setIsValidating(true)
    try {
      const response = await api.get<ValidationResult>('/companies/validate', {
        params: { name: name.trim() }
      })
      setNameExists(response.name_exists)
    } catch (error) {
      console.error('Error validating company name:', error)
      setNameExists(null)
    } finally {
      setIsValidating(false)
    }
  }, [])

  const validateRUT = useCallback(async (rut: string) => {
    if (!rut || rut.trim().length < 8) {
      setRutExists(null)
      return
    }

    setIsValidating(true)
    try {
      const response = await api.get<ValidationResult>('/companies/validate', {
        params: { rut: rut.trim() }
      })
      setRutExists(response.rut_exists)
    } catch (error) {
      console.error('Error validating company RUT:', error)
      setRutExists(null)
    } finally {
      setIsValidating(false)
    }
  }, [])

  return {
    validateName,
    validateRUT,
    nameExists,
    rutExists,
    isValidating,
  }
}

// Hook for debounced validation
export function useDebouncedCompanyValidation(delay: number = 500): UseCompanyValidationReturn {
  const validation = useCompanyValidation()
  const [nameTimeout, setNameTimeout] = useState<NodeJS.Timeout | null>(null)
  const [rutTimeout, setRutTimeout] = useState<NodeJS.Timeout | null>(null)

  const debouncedValidateName = useCallback((name: string) => {
    if (nameTimeout) {
      clearTimeout(nameTimeout)
    }

    const timeout = setTimeout(() => {
      validation.validateName(name)
    }, delay)

    setNameTimeout(timeout)
  }, [delay, nameTimeout, validation])

  const debouncedValidateRUT = useCallback((rut: string) => {
    if (rutTimeout) {
      clearTimeout(rutTimeout)
    }

    const timeout = setTimeout(() => {
      validation.validateRUT(rut)
    }, delay)

    setRutTimeout(timeout)
  }, [delay, rutTimeout, validation])

  useEffect(() => {
    return () => {
      if (nameTimeout) clearTimeout(nameTimeout)
      if (rutTimeout) clearTimeout(rutTimeout)
    }
  }, [nameTimeout, rutTimeout])

  return {
    validateName: debouncedValidateName,
    validateRUT: debouncedValidateRUT,
    nameExists: validation.nameExists,
    rutExists: validation.rutExists,
    isValidating: validation.isValidating,
  }
}
