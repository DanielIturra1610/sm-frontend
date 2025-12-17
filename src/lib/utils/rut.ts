/**
 * Chilean RUT (Rol Único Tributario) validation and formatting utilities
 * RUT format: XX.XXX.XXX-X where X is the verification digit
 */

/**
 * Clean RUT string by removing dots and hyphens
 */
export function cleanRUT(rut: string): string {
  return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase()
}

/**
 * Calculate RUT verification digit
 */
export function calculateVerifier(rutBody: string): string {
  let sum = 0
  let multiplier = 2

  for (let i = rutBody.length - 1; i >= 0; i--) {
    sum += parseInt(rutBody[i]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = sum % 11
  const calculated = 11 - remainder

  if (calculated === 11) return '0'
  if (calculated === 10) return 'K'
  return calculated.toString()
}

/**
 * Validate Chilean RUT with verification digit
 */
export function validateRUT(rut: string): boolean {
  const cleanRut = cleanRUT(rut)

  // Check minimum length (7 digits + 1 verifier)
  if (cleanRut.length < 8 || cleanRut.length > 9) {
    return false
  }

  // Extract body and verifier digit
  const body = cleanRut.slice(0, -1)
  const verifier = cleanRut.slice(-1)

  // Check that body contains only numbers
  if (!/^\d+$/.test(body)) {
    return false
  }

  // Calculate and compare verifier digit
  const expectedVerifier = calculateVerifier(body)
  return verifier === expectedVerifier
}

/**
 * Format RUT with dots and hyphen (XX.XXX.XXX-X)
 */
export function formatRUT(rut: string): string {
  const cleanRut = cleanRUT(rut)
  
  if (cleanRut.length < 2) return cleanRut

  const body = cleanRut.slice(0, -1)
  const verifier = cleanRut.slice(-1)

  // Add dots every 3 digits from right to left
  const bodyWithDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  return `${bodyWithDots}-${verifier}`
}

/**
 * Validate and format RUT in one step
 * Returns formatted RUT if valid, null if invalid
 */
export function validateAndFormatRUT(rut: string): string | null {
  if (!validateRUT(rut)) return null
  return formatRUT(rut)
}

/**
 * Get RUT validation error message in Spanish
 */
export function getRUTErrorMessage(rut: string): string | null {
  if (!rut || rut.trim().length === 0) {
    return 'RUT es requerido'
  }

  const cleanRut = cleanRUT(rut)

  if (cleanRut.length < 8) {
    return 'RUT debe tener al menos 8 caracteres'
  }

  if (cleanRut.length > 9) {
    return 'RUT debe tener como máximo 9 caracteres'
  }

  const body = cleanRut.slice(0, -1)
  if (!/^\d+$/.test(body)) {
    return 'RUT debe contener solo números antes del dígito verificador'
  }

  if (!validateRUT(rut)) {
    return 'RUT inválido. Verifica el formato y dígito verificador (ej: 12.345.678-9)'
  }

  return null
}
