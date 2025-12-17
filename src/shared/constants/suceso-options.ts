import type { SucesoCategory } from '@/shared/types/api'

export interface SucesoOption {
  value: string
  label: string
}

export interface SucesoCategoryOption {
  value: SucesoCategory
  label: string
  tipos: SucesoOption[]
}

export const SUCESO_CATEGORIES: SucesoCategoryOption[] = [
  {
    value: 'accidente',
    label: 'Accidente',
    tipos: [
      { value: 'acc_trabajo_con_baja', label: 'Del trabajo con baja' },
      { value: 'acc_trabajo_sin_baja', label: 'Del trabajo sin baja' },
      { value: 'acc_trayecto_con_baja', label: 'De trayecto con baja' },
      { value: 'acc_trayecto_sin_baja', label: 'De trayecto sin baja' },
      { value: 'acc_ambiental', label: 'Ambiental' },
    ],
  },
  {
    value: 'incidente',
    label: 'Incidente',
    tipos: [
      { value: 'inc_laboral', label: 'Laboral' },
      { value: 'inc_industrial', label: 'Industrial' },
      { value: 'inc_ambiental', label: 'Ambiental' },
      { value: 'inc_plgf', label: 'PLGF' },
    ],
  },
  {
    value: 'tolerancia_0',
    label: 'Tolerancia 0',
    tipos: [
      { value: 't0_accion_insegura', label: 'Acción insegura' },
      { value: 't0_condicion_insegura', label: 'Condición insegura' },
      { value: 't0_stop_work', label: 'Paralización de faena (Stop Work)' },
    ],
  },
]

// Helper para obtener el label de una categoría
export function getSucesoCategoryLabel(categoria: SucesoCategory): string {
  const found = SUCESO_CATEGORIES.find((c) => c.value === categoria)
  return found ? found.label : categoria
}

// Helper para obtener el label de un tipo de suceso
export function getSucesoTypeLabel(tipo: string): string {
  for (const category of SUCESO_CATEGORIES) {
    const found = category.tipos.find((t) => t.value === tipo)
    if (found) return found.label
  }
  return tipo
}

// Helper para obtener los tipos de una categoría
export function getSucesoTypesByCategory(categoria: SucesoCategory): SucesoOption[] {
  const found = SUCESO_CATEGORIES.find((c) => c.value === categoria)
  return found ? found.tipos : []
}
