/**
 * Hook for automatically calculating costs from various data sources
 *
 * Sources:
 * - Equipment damage (costo_estimado from equipos_danados)
 * - Lost work days (calculated from personas_involucradas with injuries)
 * - Action plan items (estimated implementation costs)
 */

import { useMemo } from 'react'
import type {
  EquipoDanado,
  EquipoDanadoPrefill,
  PersonaInvolucrada,
  ActionPlanItem,
  CostoItem,
} from '@/shared/types/api'

export interface CalculatedCost {
  concepto: string
  monto: number
  moneda: string
  origen: 'equipo_danado' | 'dias_perdidos' | 'plan_accion' | 'manual'
  calculado: boolean
  descripcion?: string
}

interface UseCalculatedCostsInput {
  equiposDanados?: (EquipoDanado | EquipoDanadoPrefill)[]
  personasInvolucradas?: PersonaInvolucrada[]
  actionPlanItems?: ActionPlanItem[]
  costoDiarioPromedio?: number // Average daily cost per worker (default: 50000 CLP)
  diasIncapacidadPorLesion?: Record<string, number> // Days by injury type
}

interface UseCalculatedCostsResult {
  costos: CalculatedCost[]
  totalEstimado: number
  moneda: string
  hasEquipmentCosts: boolean
  hasLaborCosts: boolean
  hasActionPlanCosts: boolean
}

// Default days of incapacity by injury severity/type
const DEFAULT_DIAS_POR_LESION: Record<string, number> = {
  'leve': 1,
  'moderada': 5,
  'grave': 15,
  'muy grave': 30,
  'fallecimiento': 0,
  'sin lesion': 0,
  'contusion': 3,
  'fractura': 30,
  'herida': 5,
  'quemadura': 10,
  'esguince': 7,
  'luxacion': 14,
}

const DEFAULT_COSTO_DIARIO = 50000 // CLP

/**
 * Hook to calculate estimated costs from incident data
 */
export function useCalculatedCosts({
  equiposDanados = [],
  personasInvolucradas = [],
  actionPlanItems = [],
  costoDiarioPromedio = DEFAULT_COSTO_DIARIO,
  diasIncapacidadPorLesion = DEFAULT_DIAS_POR_LESION,
}: UseCalculatedCostsInput): UseCalculatedCostsResult {
  const costos = useMemo<CalculatedCost[]>(() => {
    const result: CalculatedCost[] = []

    // 1. Equipment damage costs
    equiposDanados.forEach((equipo) => {
      const costo = 'costo_estimado' in equipo ? equipo.costo_estimado : undefined
      if (costo && costo > 0) {
        result.push({
          concepto: `Reparacion/Reemplazo - ${equipo.nombre}`,
          monto: costo,
          moneda: 'CLP',
          origen: 'equipo_danado',
          calculado: true,
          descripcion: equipo.descripcion || ('tipo_dano' in equipo ? equipo.tipo_dano : undefined),
        })
      }
    })

    // 2. Lost work days costs
    const personasConLesion = personasInvolucradas.filter(
      (p) => p.tipo_lesion && p.tipo_lesion.toLowerCase() !== 'sin lesion'
    )

    if (personasConLesion.length > 0) {
      let totalDiasPerdidos = 0
      const detalles: string[] = []

      personasConLesion.forEach((persona) => {
        const tipoLesion = persona.tipo_lesion?.toLowerCase() || ''
        const gravedad = persona.gravedad?.toLowerCase() || ''

        // Try to find days by gravedad first, then by tipo_lesion
        let dias = diasIncapacidadPorLesion[gravedad] || 0
        if (dias === 0) {
          // Try matching partial tipo_lesion
          for (const [key, value] of Object.entries(diasIncapacidadPorLesion)) {
            if (tipoLesion.includes(key)) {
              dias = value
              break
            }
          }
        }

        if (dias === 0) {
          dias = 3 // Default assumption
        }

        totalDiasPerdidos += dias
        detalles.push(`${persona.nombre}: ${dias} dias`)
      })

      if (totalDiasPerdidos > 0) {
        result.push({
          concepto: `Dias perdidos (${personasConLesion.length} trabajador${personasConLesion.length > 1 ? 'es' : ''} x ${totalDiasPerdidos} dias)`,
          monto: totalDiasPerdidos * costoDiarioPromedio,
          moneda: 'CLP',
          origen: 'dias_perdidos',
          calculado: true,
          descripcion: detalles.join(', '),
        })
      }
    }

    // 3. Action plan implementation costs (estimated based on task complexity)
    // This is a rough estimate - in a real scenario, each task would have its own cost
    const pendingActions = actionPlanItems.filter(
      (item) => item.estado !== 'completed' && item.estado !== 'cancelled'
    )

    if (pendingActions.length > 0) {
      // Estimate based on number of pending actions
      // This is a placeholder - real implementation would need actual cost data
      const estimatedCostPerAction = 100000 // CLP base estimate per action
      const totalActionCost = pendingActions.length * estimatedCostPerAction

      result.push({
        concepto: `Implementacion Plan de Accion (${pendingActions.length} tarea${pendingActions.length > 1 ? 's' : ''} pendiente${pendingActions.length > 1 ? 's' : ''})`,
        monto: totalActionCost,
        moneda: 'CLP',
        origen: 'plan_accion',
        calculado: true,
        descripcion: pendingActions.map((a) => a.tarea).slice(0, 3).join(', ') +
          (pendingActions.length > 3 ? '...' : ''),
      })
    }

    return result
  }, [equiposDanados, personasInvolucradas, actionPlanItems, costoDiarioPromedio, diasIncapacidadPorLesion])

  const totalEstimado = useMemo(() => {
    return costos.reduce((sum, c) => sum + c.monto, 0)
  }, [costos])

  const hasEquipmentCosts = costos.some((c) => c.origen === 'equipo_danado')
  const hasLaborCosts = costos.some((c) => c.origen === 'dias_perdidos')
  const hasActionPlanCosts = costos.some((c) => c.origen === 'plan_accion')

  return {
    costos,
    totalEstimado,
    moneda: 'CLP',
    hasEquipmentCosts,
    hasLaborCosts,
    hasActionPlanCosts,
  }
}

/**
 * Convert calculated costs to CostoItem format for form submission
 */
export function convertToCostoItems(calculatedCosts: CalculatedCost[]): CostoItem[] {
  return calculatedCosts.map((c) => ({
    concepto: c.concepto,
    monto: c.monto,
    moneda: c.moneda,
    descripcion: c.descripcion,
  }))
}

/**
 * Format currency for display
 */
export function formatCurrency(monto: number, moneda: string = 'CLP'): string {
  if (moneda === 'CLP') {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto)
  }

  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: moneda,
  }).format(monto)
}
