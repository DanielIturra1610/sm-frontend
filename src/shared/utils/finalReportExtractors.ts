/**
 * Stegmaier Management - Final Report Data Extractors
 * Utilities for extracting, consolidating, and deduplicating data
 * from multiple sources for Final Report generation
 */

import type {
  FiveWhysAnalysis,
  FishboneAnalysis,
  CausaRaizSummary,
  ZeroToleranceReport,
  Fotografia,
} from '@/shared/types/api'
import type {
  CausalTreeAnalysis,
  CausalNode,
  PreventiveMeasure,
} from '@/shared/types/causal-tree'

// ============================================================================
// TYPES
// ============================================================================

export interface ExtractedCause {
  problema: string
  causa_raiz: string
  accion_plan: string
  metodologia: string
}

export interface PersonaConsolidada {
  nombre: string
  cargo: string
  empresa: string
  tipo_lesion: string
  gravedad: string
  parte_cuerpo: string
  descripcion: string
  fuentes: string[]
}

export interface CausalTreeWithDetails {
  analysis: CausalTreeAnalysis
  nodes: CausalNode[]
  measures: PreventiveMeasure[]
}

// ============================================================================
// EXTRACTION FROM FIVE WHYS (ALL ANALYSES)
// ============================================================================

/**
 * Extract root causes from ALL Five Whys analyses
 * Fixes the limitation where only the first analysis was processed
 */
export function extractAllFiveWhysCauses(analyses: FiveWhysAnalysis[]): ExtractedCause[] {
  const causes: ExtractedCause[] = []

  analyses.forEach((analysis) => {
    // Extract main rootCause
    if (analysis.rootCause) {
      const relatedAction = analysis.actionItems?.find(
        (a) => a.actionType === 'corrective' || a.priority === 'high'
      )

      causes.push({
        problema: analysis.problemStatement || 'Problema identificado en analisis 5 Por Ques',
        causa_raiz: analysis.rootCause,
        accion_plan: relatedAction?.description || '',
        metodologia: '5 Por Ques',
      })
    }

    // Extract from whys marked as root cause (if different from main)
    if (analysis.whys) {
      analysis.whys
        .filter((why) => why.isRootCause && why.answer && why.answer !== analysis.rootCause)
        .forEach((why) => {
          causes.push({
            problema: why.question || analysis.problemStatement || '',
            causa_raiz: why.answer || '',
            accion_plan: '',
            metodologia: '5 Por Ques',
          })
        })
    }
  })

  return causes
}

// ============================================================================
// EXTRACTION FROM FISHBONE (ALL ANALYSES)
// ============================================================================

/**
 * Extract root causes from ALL Fishbone analyses
 * Updated to use the correct FishboneAnalysis structure with flat causes array
 */
export function extractAllFishboneCauses(analyses: FishboneAnalysis[]): ExtractedCause[] {
  const causes: ExtractedCause[] = []

  analyses.forEach((analysis) => {
    const problem = analysis.problem || 'Problema identificado en diagrama Ishikawa'

    // Extract from the flat causes array (correct structure)
    if (analysis.causes && analysis.causes.length > 0) {
      // Get level 1 causes (main causes) sorted by impact and priority
      const mainCauses = analysis.causes
        .filter((cause) => cause.level === 1)
        .sort((a, b) => {
          // Prioritize by high impact first
          const impactOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
          const impactA = impactOrder[a.impact] || 1
          const impactB = impactOrder[b.impact] || 1
          if (impactA !== impactB) return impactB - impactA
          // Then by priority number (lower is more important)
          return a.priority - b.priority
        })

      mainCauses.forEach((cause) => {
        // Get subcauses for this main cause
        const subCauses = analysis.causes.filter(
          (c) => c.parentId === cause.id && c.level === 2
        )

        // Add the main cause
        causes.push({
          problema: `[${cause.category}] ${problem}`,
          causa_raiz: cause.description,
          accion_plan: cause.notes || '',
          metodologia: 'Ishikawa',
        })

        // Add high-impact subcauses as separate entries
        subCauses
          .filter((sc) => sc.impact === 'high' || sc.priority <= 3)
          .forEach((subCause) => {
            causes.push({
              problema: `[${cause.category}] ${cause.description}`,
              causa_raiz: subCause.description,
              accion_plan: subCause.notes || '',
              metodologia: 'Ishikawa',
            })
          })
      })
    }

    // Fallback: Also check categories structure (alternative frontend format)
    if ((!analysis.causes || analysis.causes.length === 0) && analysis.categories) {
      analysis.categories.forEach((category) => {
        category.causes?.forEach((cause) => {
          causes.push({
            problema: `[${category.name}] ${problem}`,
            causa_raiz: cause.description,
            accion_plan: '',
            metodologia: 'Ishikawa',
          })

          // Subcauses from the nested structure
          cause.subCauses?.forEach((subCause) => {
            causes.push({
              problema: `[${category.name}] ${cause.description}`,
              causa_raiz: subCause,
              accion_plan: '',
              metodologia: 'Ishikawa',
            })
          })
        })
      })
    }
  })

  return causes
}

// ============================================================================
// EXTRACTION FROM CAUSAL TREE (ALL ANALYSES)
// ============================================================================

/**
 * Extract root causes from ALL Causal Tree analyses
 * Includes nodes and preventive measures
 */
export function extractAllCausalTreeCauses(
  analysesWithDetails: CausalTreeWithDetails[]
): ExtractedCause[] {
  const causes: ExtractedCause[] = []

  analysesWithDetails.forEach(({ analysis, nodes, measures }) => {
    const finalEvent = analysis.finalEvent || analysis.title || 'Evento analizado en arbol causal'

    // Extract from nodes marked as root cause
    const rootCauseNodes = nodes.filter((node) => node.isRootCause)

    rootCauseNodes.forEach((node) => {
      // Find related preventive measure
      const relatedMeasure = measures?.find((m) => m.targetCauseId === node.id)

      causes.push({
        problema: finalEvent,
        causa_raiz: node.fact || '',
        accion_plan: relatedMeasure?.description || '',
        metodologia: 'Arbol Causal',
      })
    })
  })

  return causes
}

// ============================================================================
// CAUSE DEDUPLICATION
// ============================================================================

interface CauseWithScore extends ExtractedCause {
  score: number
  fuentes: string[]
}

/**
 * Deduplicate causes from multiple sources
 * Merges similar causes and combines their sources
 */
export function deduplicateCausas(causas: ExtractedCause[]): ExtractedCause[] {
  if (causas.length === 0) return []

  const unique = new Map<string, CauseWithScore>()

  causas.forEach((causa) => {
    // Normalize text for comparison
    const normalizedCausa = causa.causa_raiz
      .toLowerCase()
      .trim()
      .replace(/[.,;:]/g, '')
      .replace(/\s+/g, ' ')

    // Create key based on first 5 significant words
    const words = normalizedCausa.split(' ').filter((w) => w.length > 2)
    const keyWords = words.slice(0, 5).join(' ')

    if (keyWords.length < 3) {
      // Too short to compare, add as unique
      unique.set(causa.causa_raiz, {
        ...causa,
        score: 1,
        fuentes: [causa.metodologia],
      })
      return
    }

    if (unique.has(keyWords)) {
      // Merge: keep the more complete version
      const existing = unique.get(keyWords)!
      unique.set(keyWords, {
        ...existing,
        // Use the longer description
        causa_raiz:
          causa.causa_raiz.length > existing.causa_raiz.length
            ? causa.causa_raiz
            : existing.causa_raiz,
        // Combine actions if different
        accion_plan: existing.accion_plan || causa.accion_plan,
        // Combine sources
        fuentes: [...new Set([...existing.fuentes, causa.metodologia])],
        score: existing.score + 1,
      })
    } else {
      unique.set(keyWords, {
        ...causa,
        score: 1,
        fuentes: [causa.metodologia],
      })
    }
  })

  // Sort by score (more sources = more relevant)
  return Array.from(unique.values())
    .sort((a, b) => b.score - a.score)
    .map(({ score, fuentes, ...causa }) => ({
      ...causa,
      metodologia: fuentes.length > 1 ? fuentes.join(', ') : causa.metodologia,
    }))
}

// ============================================================================
// PERSON CONSOLIDATION
// ============================================================================

interface PersonaInput {
  nombre: string
  cargo?: string
  empresa?: string
  tipo_lesion?: string
  gravedad?: string
  parte_cuerpo?: string
  descripcion?: string
}

/**
 * Consolidate persons from multiple report sources
 * Merges duplicate entries and tracks sources
 */
export function consolidarPersonas(
  flashPersonas: PersonaInput[] = [],
  zeroTolerancePersonas: PersonaInput[] = [],
  immediateActionsResponsables: string[] = []
): PersonaConsolidada[] {
  const personas = new Map<string, PersonaConsolidada>()

  // Helper to normalize name for comparison
  const normalizeKey = (nombre: string): string =>
    nombre.toLowerCase().trim().replace(/\s+/g, ' ')

  // Add from Flash Report
  flashPersonas.forEach((p) => {
    if (!p.nombre) return
    const key = normalizeKey(p.nombre)
    personas.set(key, {
      nombre: p.nombre,
      cargo: p.cargo || '',
      empresa: p.empresa || '',
      tipo_lesion: p.tipo_lesion || '',
      gravedad: p.gravedad || '',
      parte_cuerpo: p.parte_cuerpo || '',
      descripcion: p.descripcion || '',
      fuentes: ['Flash Report'],
    })
  })

  // Merge from Zero Tolerance
  zeroTolerancePersonas.forEach((p) => {
    if (!p.nombre) return
    const key = normalizeKey(p.nombre)

    if (personas.has(key)) {
      const existing = personas.get(key)!
      personas.set(key, {
        ...existing,
        // Fill empty fields
        cargo: existing.cargo || p.cargo || '',
        empresa: existing.empresa || p.empresa || '',
        tipo_lesion: existing.tipo_lesion || p.tipo_lesion || '',
        gravedad: existing.gravedad || p.gravedad || '',
        parte_cuerpo: existing.parte_cuerpo || p.parte_cuerpo || '',
        descripcion: existing.descripcion || p.descripcion || '',
        fuentes: [...existing.fuentes, 'Zero Tolerance'],
      })
    } else {
      personas.set(key, {
        nombre: p.nombre,
        cargo: p.cargo || '',
        empresa: p.empresa || '',
        tipo_lesion: p.tipo_lesion || '',
        gravedad: p.gravedad || '',
        parte_cuerpo: p.parte_cuerpo || '',
        descripcion: p.descripcion || '',
        fuentes: ['Zero Tolerance'],
      })
    }
  })

  // Add responsables from Immediate Actions (if not already present)
  immediateActionsResponsables.forEach((nombre) => {
    if (!nombre) return
    const key = normalizeKey(nombre)

    if (!personas.has(key)) {
      personas.set(key, {
        nombre,
        cargo: 'Responsable de Accion',
        empresa: '',
        tipo_lesion: '',
        gravedad: '',
        parte_cuerpo: '',
        descripcion: 'Participante en acciones inmediatas',
        fuentes: ['Acciones Inmediatas'],
      })
    } else {
      // Just add the source
      const existing = personas.get(key)!
      if (!existing.fuentes.includes('Acciones Inmediatas')) {
        existing.fuentes.push('Acciones Inmediatas')
      }
    }
  })

  return Array.from(personas.values())
}

// ============================================================================
// CONCLUSIONS GENERATOR
// ============================================================================

/**
 * Enhanced input for conclusions generation with full analysis context
 */
export interface ConclusionsGeneratorInput {
  causas: ExtractedCause[]
  problemContext?: string
  fishboneAnalyses?: FishboneAnalysis[]
  personasAfectadas?: number
  equiposDanados?: number
  severidad?: string
  planAccionProgreso?: number
}

/**
 * Generate detailed conclusions text from extracted causes and analyses
 * Enhanced to include category breakdown and impact analysis for Ishikawa
 */
export function generateConclusions(
  causasOrInput: ExtractedCause[] | ConclusionsGeneratorInput,
  problemContext?: string
): string {
  // Support both old signature (array) and new signature (object)
  let causas: ExtractedCause[]
  let fishboneAnalyses: FishboneAnalysis[] | undefined
  let personasAfectadas: number | undefined
  let equiposDanados: number | undefined
  let severidad: string | undefined
  let planAccionProgreso: number | undefined

  if (Array.isArray(causasOrInput)) {
    causas = causasOrInput
  } else {
    causas = causasOrInput.causas
    problemContext = causasOrInput.problemContext
    fishboneAnalyses = causasOrInput.fishboneAnalyses
    personasAfectadas = causasOrInput.personasAfectadas
    equiposDanados = causasOrInput.equiposDanados
    severidad = causasOrInput.severidad
    planAccionProgreso = causasOrInput.planAccionProgreso
  }

  if (causas.length === 0) return ''

  const parts: string[] = []

  // 1. Opening with problem context
  if (problemContext) {
    parts.push(`La investigacion se enfoco en analizar: "${problemContext}".`)
    parts.push('')
  }

  // 2. Group causes by methodology
  const byMethodology: Record<string, ExtractedCause[]> = {}
  causas.forEach((causa) => {
    const key = causa.metodologia || 'Otro'
    if (!byMethodology[key]) byMethodology[key] = []
    byMethodology[key].push(causa)
  })

  // 3. Summary of methodologies used
  const metodologias = Object.keys(byMethodology)
  if (metodologias.length > 0) {
    const metodologiasTexto = metodologias.length === 1
      ? metodologias[0]
      : metodologias.slice(0, -1).join(', ') + ' y ' + metodologias[metodologias.length - 1]
    parts.push(`Se utilizaron las siguientes metodologias de analisis: ${metodologiasTexto}.`)
  }

  // 4. If we have Fishbone analyses, show category breakdown
  if (fishboneAnalyses && fishboneAnalyses.length > 0) {
    const categoryStats = new Map<string, { total: number; highImpact: number }>()

    fishboneAnalyses.forEach((analysis) => {
      analysis.causes?.forEach((cause) => {
        const cat = cause.category || 'General'
        const stats = categoryStats.get(cat) || { total: 0, highImpact: 0 }
        stats.total++
        if (cause.impact === 'high') stats.highImpact++
        categoryStats.set(cat, stats)
      })
    })

    if (categoryStats.size > 0) {
      parts.push('')
      parts.push('Distribucion de causas por categoria (Ishikawa):')
      categoryStats.forEach((stats, category) => {
        const highImpactText = stats.highImpact > 0 ? ` (${stats.highImpact} de alto impacto)` : ''
        parts.push(`- ${category}: ${stats.total} causa${stats.total > 1 ? 's' : ''}${highImpactText}`)
      })
    }
  }

  // 5. Main causes identified
  parts.push('')
  if (causas.length === 1) {
    parts.push('Se identifico una causa raiz principal:')
  } else {
    parts.push(`Se identificaron ${causas.length} causas raiz:`)
  }

  // Show causes grouped by methodology (max 5 per methodology)
  Object.entries(byMethodology).forEach(([metodologia, causes]) => {
    parts.push('')
    parts.push(`${metodologia}:`)
    causes.slice(0, 5).forEach((cause, idx) => {
      // Extract category from problema if present [Category]
      const categoryMatch = cause.problema.match(/\[([^\]]+)\]/)
      const prefix = categoryMatch ? `[${categoryMatch[1]}] ` : ''
      parts.push(`${idx + 1}. ${prefix}${cause.causa_raiz}`)
    })
    if (causes.length > 5) {
      parts.push(`   ... y ${causes.length - 5} causa${causes.length - 5 > 1 ? 's' : ''} adicional${causes.length - 5 > 1 ? 'es' : ''}`)
    }
  })

  // 6. Impact summary
  const impacts: string[] = []
  if (personasAfectadas && personasAfectadas > 0) {
    impacts.push(`${personasAfectadas} persona${personasAfectadas > 1 ? 's' : ''} involucrada${personasAfectadas > 1 ? 's' : ''}`)
  }
  if (equiposDanados && equiposDanados > 0) {
    impacts.push(`${equiposDanados} equipo${equiposDanados > 1 ? 's' : ''} afectado${equiposDanados > 1 ? 's' : ''}`)
  }
  if (impacts.length > 0) {
    parts.push('')
    parts.push(`Impacto del incidente: ${impacts.join(', ')}.`)
  }

  if (severidad) {
    parts.push(`Severidad clasificada como: ${severidad}.`)
  }

  // 7. Actions summary
  const causesWithActions = causas.filter((c) => c.accion_plan && c.accion_plan.trim())
  if (causesWithActions.length > 0) {
    parts.push('')
    parts.push('Acciones correctivas propuestas:')
    causesWithActions.slice(0, 5).forEach((cause, idx) => {
      parts.push(`${idx + 1}. ${cause.accion_plan}`)
    })
  }

  // 8. Action plan progress
  if (planAccionProgreso !== undefined && planAccionProgreso >= 0) {
    parts.push('')
    const estadoPlan = planAccionProgreso === 100
      ? 'completado al 100%'
      : planAccionProgreso > 50
        ? `con un avance del ${planAccionProgreso}%`
        : `iniciado con ${planAccionProgreso}% de avance`
    parts.push(`El plan de accion se encuentra actualmente ${estadoPlan}.`)
  }

  // 9. Closing recommendation
  parts.push('')
  parts.push('Se recomienda implementar las acciones correctivas identificadas y realizar seguimiento para prevenir la recurrencia de eventos similares.')

  return parts.join('\n')
}

// ============================================================================
// CONVERT TO FORM FORMAT
// ============================================================================

/**
 * Convert extracted causes to the CausaRaizSummary format used in the form
 */
export function convertToCausaRaizSummary(causes: ExtractedCause[]): CausaRaizSummary[] {
  return causes.map((c) => ({
    problema: c.problema,
    causa_raiz: c.causa_raiz,
    accion_plan: c.accion_plan || undefined,
    metodologia: c.metodologia || undefined,
  }))
}

// ============================================================================
// ZERO TOLERANCE EXTRACTION
// ============================================================================

export interface ZeroToleranceExtraction {
  severidad: string
  acciones_tomadas: string
  personas: PersonaConsolidada[]
  fotografias: EvidenciaConsolidada[]
  descripcion: string
}

export interface EvidenciaConsolidada {
  url: string
  descripcion: string
  fecha?: string
  fuente: string
  seleccionada: boolean
}

/**
 * Extract data from Zero Tolerance report for Final Report
 */
export function extractFromZeroTolerance(
  report: ZeroToleranceReport | null | undefined
): ZeroToleranceExtraction | null {
  if (!report) return null

  return {
    severidad: report.severidad || '',
    acciones_tomadas: report.acciones_tomadas || '',
    descripcion: report.descripcion || '',
    personas: (report.personas_involucradas || []).map((p) => ({
      nombre: p.nombre,
      cargo: p.cargo || '',
      empresa: p.empresa || '',
      tipo_lesion: '',
      gravedad: report.severidad || '',
      parte_cuerpo: '',
      descripcion: '',
      fuentes: ['Zero Tolerance'],
    })),
    fotografias: (report.fotografias || []).map((f: Fotografia) => ({
      url: f.url,
      descripcion: f.descripcion || 'Foto Zero Tolerance',
      fecha: report.fecha_hora,
      fuente: 'Zero Tolerance',
      seleccionada: true,
    })),
  }
}

// ============================================================================
// EVIDENCE CONSOLIDATION
// ============================================================================

/**
 * Consolidate evidence/photos from multiple report sources
 */
export function consolidarEvidencias(
  flashFotos: Fotografia[] = [],
  zeroToleranceFotos: Fotografia[] = [],
  incidentAttachments: Array<{ url: string; name?: string; type?: string }> = []
): EvidenciaConsolidada[] {
  const evidencias: EvidenciaConsolidada[] = []

  // From Flash Report
  flashFotos.forEach((foto) => {
    evidencias.push({
      url: foto.url,
      descripcion: foto.descripcion || 'Evidencia Flash Report',
      fuente: 'Flash Report',
      seleccionada: true,
    })
  })

  // From Zero Tolerance
  zeroToleranceFotos.forEach((foto) => {
    evidencias.push({
      url: foto.url,
      descripcion: foto.descripcion || 'Foto Zero Tolerance',
      fuente: 'Zero Tolerance',
      seleccionada: true,
    })
  })

  // From Incident attachments (only images)
  incidentAttachments.forEach((att) => {
    if (att.type?.startsWith('image/')) {
      evidencias.push({
        url: att.url,
        descripcion: att.name || 'Adjunto del incidente',
        fuente: 'Incidente',
        seleccionada: false,
      })
    }
  })

  return evidencias
}
