/**
 * Report Generation Utilities
 *
 * Functions to automatically generate text content for Final Reports
 * based on extracted data from various sources.
 */

import type {
  CausaRaizSummary,
  PersonaInvolucrada,
  EquipoDanado,
  ActionPlanItem,
  ResponsableInvestigacion,
} from '@/shared/types/api'
import type { ExtractedCause } from './finalReportExtractors'

// ============================================================================
// CONCLUSIONS GENERATOR
// ============================================================================

interface ConclusionGeneratorInput {
  causasRaiz: (CausaRaizSummary | ExtractedCause)[]
  tipoIncidente?: string
  personasAfectadas?: number
  equiposDanados?: number
  severidad?: string
  metodologiasUsadas?: string[]
  accionesTomadas?: string
  planAccionProgreso?: number
}

/**
 * Generate automatic conclusions based on incident investigation data
 */
export function generateConclusions(input: ConclusionGeneratorInput): string {
  const {
    causasRaiz,
    tipoIncidente = 'incidente',
    personasAfectadas = 0,
    equiposDanados = 0,
    severidad,
    metodologiasUsadas = [],
    accionesTomadas,
    planAccionProgreso,
  } = input

  const parts: string[] = []

  // Opening statement
  const tipoTexto = tipoIncidente.toLowerCase().includes('accidente')
    ? 'accidente'
    : 'incidente'

  if (causasRaiz.length > 0) {
    const metodologias = getUniqueMetodologias(causasRaiz, metodologiasUsadas)
    const metodologiaTexto = metodologias.length > 0
      ? ` mediante ${formatList(metodologias)}`
      : ''

    parts.push(
      `Tras la investigacion del ${tipoTexto} ocurrido, se identificaron ${causasRaiz.length} causa${causasRaiz.length > 1 ? 's' : ''} raiz principal${causasRaiz.length > 1 ? 'es' : ''}${metodologiaTexto}.`
    )

    // List main causes (max 3)
    const mainCauses = causasRaiz.slice(0, 3)
    if (mainCauses.length > 0) {
      parts.push('\nLas causas identificadas fueron:')
      mainCauses.forEach((c) => {
        parts.push(`- ${c.causa_raiz}`)
      })
      if (causasRaiz.length > 3) {
        parts.push(`- (y ${causasRaiz.length - 3} causa${causasRaiz.length - 3 > 1 ? 's' : ''} adicional${causasRaiz.length - 3 > 1 ? 'es' : ''})`)
      }
    }
  } else {
    parts.push(
      `Se realizo la investigacion del ${tipoTexto} para determinar las causas y establecer medidas correctivas.`
    )
  }

  // Impact statement
  const impacts: string[] = []
  if (personasAfectadas > 0) {
    impacts.push(`${personasAfectadas} persona${personasAfectadas > 1 ? 's' : ''} afectada${personasAfectadas > 1 ? 's' : ''}`)
  }
  if (equiposDanados > 0) {
    impacts.push(`${equiposDanados} equipo${equiposDanados > 1 ? 's' : ''} danado${equiposDanados > 1 ? 's' : ''}`)
  }
  if (impacts.length > 0) {
    parts.push(`\nEl ${tipoTexto} resulto en ${formatList(impacts)}.`)
  }

  // Severity if available
  if (severidad) {
    parts.push(`La severidad del evento fue clasificada como "${severidad}".`)
  }

  // Actions taken
  if (accionesTomadas) {
    parts.push(`\nSe implementaron acciones inmediatas para controlar la situacion.`)
  }

  // Action plan progress
  if (planAccionProgreso !== undefined && planAccionProgreso >= 0) {
    const estadoPlan = planAccionProgreso === 100
      ? 'completado al 100%'
      : planAccionProgreso > 50
        ? `con un avance del ${planAccionProgreso}%`
        : `iniciado con ${planAccionProgreso}% de avance`

    parts.push(
      `Se establecio un plan de accion con medidas correctivas y preventivas, actualmente ${estadoPlan}.`
    )
  }

  return parts.join('\n')
}

function getUniqueMetodologias(
  causas: (CausaRaizSummary | ExtractedCause)[],
  additional: string[] = []
): string[] {
  const metodologias = new Set<string>()

  causas.forEach((c) => {
    if (c.metodologia) {
      // Normalize methodology names
      const met = c.metodologia.toLowerCase()
      if (met.includes('5 por') || met.includes('5 why') || met.includes('porques')) {
        metodologias.add('analisis 5 Por Ques')
      } else if (met.includes('ishikawa') || met.includes('fishbone') || met.includes('espina')) {
        metodologias.add('diagrama de Ishikawa')
      } else if (met.includes('arbol') || met.includes('causal tree')) {
        metodologias.add('Arbol Causal')
      } else {
        metodologias.add(c.metodologia)
      }
    }
  })

  additional.forEach((m) => metodologias.add(m))

  return Array.from(metodologias)
}

function formatList(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} y ${items[1]}`
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

// ============================================================================
// LESSONS LEARNED GENERATOR
// ============================================================================

interface LessonsLearnedInput {
  causasRaiz: (CausaRaizSummary | ExtractedCause)[]
  tipoIncidente?: string
  accionesCorrectivas?: string[]
}

/**
 * Generate suggested lessons learned based on root causes
 */
export function generateLessonsLearned(input: LessonsLearnedInput): string[] {
  const { causasRaiz, tipoIncidente, accionesCorrectivas = [] } = input

  const lessons: string[] = []

  // Generate lessons from root causes
  causasRaiz.forEach((causa) => {
    const causaLower = causa.causa_raiz.toLowerCase()

    // Pattern matching for common cause types
    if (causaLower.includes('supervision') || causaLower.includes('control')) {
      lessons.push(
        'La supervision directa en operaciones de alto riesgo es fundamental para prevenir accidentes. Se requiere presencia de supervisor certificado en tareas criticas.'
      )
    }

    if (causaLower.includes('epp') || causaLower.includes('proteccion') || causaLower.includes('equipo')) {
      lessons.push(
        'Los EPP deben verificarse antes de cada turno. Implementar checklist obligatorio de inspeccion de equipos de proteccion personal.'
      )
    }

    if (causaLower.includes('comunicacion') || causaLower.includes('informacion')) {
      lessons.push(
        'La comunicacion entre turnos debe documentarse formalmente para evitar perdida de informacion critica sobre riesgos identificados.'
      )
    }

    if (causaLower.includes('capacitacion') || causaLower.includes('entrenamiento') || causaLower.includes('conocimiento')) {
      lessons.push(
        'Es esencial mantener programas de capacitacion continua y verificar la competencia del personal antes de asignar tareas de riesgo.'
      )
    }

    if (causaLower.includes('procedimiento') || causaLower.includes('protocolo')) {
      lessons.push(
        'Los procedimientos operativos deben revisarse periodicamente y asegurar que todo el personal los conozca y aplique correctamente.'
      )
    }

    if (causaLower.includes('mantenimiento') || causaLower.includes('falla')) {
      lessons.push(
        'El mantenimiento preventivo de equipos es clave para evitar fallas. Se debe cumplir estrictamente el programa de mantenimiento establecido.'
      )
    }
  })

  // Add lessons from corrective actions
  accionesCorrectivas.forEach((accion) => {
    if (accion && accion.length > 20) {
      lessons.push(
        `Se debe asegurar la implementacion efectiva de: ${accion.slice(0, 100)}${accion.length > 100 ? '...' : ''}`
      )
    }
  })

  // Remove duplicates and limit
  const uniqueLessons = [...new Set(lessons)]
  return uniqueLessons.slice(0, 5)
}

// ============================================================================
// ACTIONS RESUME GENERATOR
// ============================================================================

interface ActionsResumeInput {
  accionesInmediatas?: string
  actionPlanItems?: ActionPlanItem[]
  totalTareas?: number
  tareasCompletadas?: number
  porcentajeAvance?: number
}

/**
 * Generate a summary of immediate actions and action plan status
 */
export function generateActionsResume(input: ActionsResumeInput): {
  accionesInmediatasResumen: string
  planAccionResumen: string
} {
  const {
    accionesInmediatas,
    actionPlanItems = [],
    totalTareas,
    tareasCompletadas,
    porcentajeAvance,
  } = input

  // Immediate actions resume
  let accionesInmediatasResumen = ''
  if (accionesInmediatas) {
    accionesInmediatasResumen = accionesInmediatas
  } else {
    accionesInmediatasResumen = 'Se implementaron acciones inmediatas para controlar la situacion y prevenir recurrencia del evento.'
  }

  // Action plan resume
  let planAccionResumen = ''
  if (actionPlanItems.length > 0) {
    const total = totalTareas ?? actionPlanItems.length
    const completed = tareasCompletadas ??
      actionPlanItems.filter((i) => i.estado === 'completed').length
    const progress = porcentajeAvance ??
      Math.round((completed / total) * 100)

    const pending = actionPlanItems.filter(
      (i) => i.estado === 'pending' || i.estado === 'in_progress'
    )
    const delayed = actionPlanItems.filter((i) => i.estado === 'delayed')

    planAccionResumen = `Plan de accion con ${total} tarea${total > 1 ? 's' : ''}. Avance: ${progress}%.`

    if (completed > 0) {
      planAccionResumen += ` ${completed} completada${completed > 1 ? 's' : ''}.`
    }
    if (pending.length > 0) {
      planAccionResumen += ` ${pending.length} en progreso.`
    }
    if (delayed.length > 0) {
      planAccionResumen += ` ${delayed.length} con retraso.`
    }
  } else if (totalTareas && totalTareas > 0) {
    const progress = porcentajeAvance ?? 0
    planAccionResumen = `Plan de accion con ${totalTareas} tarea${totalTareas > 1 ? 's' : ''}. Avance: ${progress}%.`
  } else {
    planAccionResumen = 'Plan de accion pendiente de definir.'
  }

  return {
    accionesInmediatasResumen,
    planAccionResumen,
  }
}

// ============================================================================
// RESPONSABLES EXTRACTOR
// ============================================================================

interface ResponsablesSource {
  flashReportAuthor?: string
  immediateActionsResponsables?: string[]
  actionPlanResponsables?: string[]
  analysisAuthors?: string[]
}

/**
 * Extract and consolidate investigation responsables from various sources
 */
export function extractResponsables(sources: ResponsablesSource): ResponsableInvestigacion[] {
  const responsablesMap = new Map<string, ResponsableInvestigacion>()

  const addResponsable = (nombre: string, cargo?: string) => {
    if (!nombre || nombre.trim() === '') return

    const key = nombre.toLowerCase().trim()
    if (!responsablesMap.has(key)) {
      responsablesMap.set(key, {
        nombre: nombre.trim(),
        cargo: cargo || 'Investigador',
        firma: '',
      })
    } else if (cargo) {
      // Update cargo if we have more info
      const existing = responsablesMap.get(key)!
      if (!existing.cargo || existing.cargo === 'Investigador') {
        existing.cargo = cargo
      }
    }
  }

  // Add flash report author
  if (sources.flashReportAuthor) {
    addResponsable(sources.flashReportAuthor, 'Autor Reporte Flash')
  }

  // Add immediate actions responsables
  sources.immediateActionsResponsables?.forEach((r) => {
    addResponsable(r, 'Responsable Acciones Inmediatas')
  })

  // Add action plan responsables
  sources.actionPlanResponsables?.forEach((r) => {
    addResponsable(r, 'Responsable Plan de Accion')
  })

  // Add analysis authors
  sources.analysisAuthors?.forEach((r) => {
    addResponsable(r, 'Analista')
  })

  return Array.from(responsablesMap.values())
}

// ============================================================================
// INCIDENT DESCRIPTION GENERATOR
// ============================================================================

interface DescriptionInput {
  descripcionBreve?: string
  lugar?: string
  fecha?: string
  hora?: string
  tipoIncidente?: string
  actividad?: string
  personasInvolucradas?: PersonaInvolucrada[]
  equiposDanados?: EquipoDanado[]
}

/**
 * Generate a detailed incident description from available data
 */
export function generateDetailedDescription(input: DescriptionInput): string {
  const {
    descripcionBreve,
    lugar,
    fecha,
    hora,
    tipoIncidente,
    actividad,
    personasInvolucradas = [],
    equiposDanados = [],
  } = input

  const parts: string[] = []

  // When and where
  if (fecha || lugar) {
    let whenWhere = 'El evento ocurrio'
    if (fecha) {
      whenWhere += ` el dia ${fecha}`
    }
    if (hora) {
      whenWhere += ` a las ${hora}`
    }
    if (lugar) {
      whenWhere += ` en ${lugar}`
    }
    parts.push(whenWhere + '.')
  }

  // What happened
  if (descripcionBreve) {
    parts.push(descripcionBreve)
  }

  // Activity being performed
  if (actividad) {
    parts.push(`Durante la realizacion de: ${actividad}.`)
  }

  // People involved
  if (personasInvolucradas.length > 0) {
    const personas = personasInvolucradas
      .map((p) => {
        let desc = p.nombre
        if (p.cargo) desc += ` (${p.cargo})`
        if (p.tipo_lesion && p.tipo_lesion !== 'Sin lesion') {
          desc += ` - ${p.tipo_lesion}`
        }
        return desc
      })
      .join(', ')

    parts.push(`Personal involucrado: ${personas}.`)
  }

  // Equipment damaged
  if (equiposDanados.length > 0) {
    const equipos = equiposDanados
      .map((e) => {
        let desc = e.nombre
        if (e.tipo_dano) desc += ` (${e.tipo_dano})`
        return desc
      })
      .join(', ')

    parts.push(`Equipos afectados: ${equipos}.`)
  }

  return parts.join('\n\n')
}
