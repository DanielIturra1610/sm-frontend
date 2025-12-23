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
 * Now also extracts action items (fixed limitation)
 */
export function extractAllFishboneCauses(analyses: FishboneAnalysis[]): ExtractedCause[] {
  const causes: ExtractedCause[] = []

  analyses.forEach((analysis) => {
    if (analysis.rootCause) {
      // Find related action - prioritize corrective and high priority
      const relatedAction = analysis.actionItems?.find(
        (a) => a.priority === 'high' || a.status === 'pending'
      )

      causes.push({
        problema: analysis.problem || 'Problema identificado en diagrama Ishikawa',
        causa_raiz: analysis.rootCause,
        accion_plan: relatedAction?.description || '',
        metodologia: 'Ishikawa',
      })
    }

    // Also extract significant causes from categories if marked
    analysis.categories?.forEach((category) => {
      category.causes?.forEach((cause) => {
        // Only add if it has sub-causes (indicating deeper analysis)
        if (cause.subCauses && cause.subCauses.length > 0) {
          cause.subCauses.forEach((subCause) => {
            // Avoid duplicating the main root cause
            if (subCause !== analysis.rootCause) {
              causes.push({
                problema: `${category.name}: ${cause.description}`,
                causa_raiz: subCause,
                accion_plan: '',
                metodologia: 'Ishikawa',
              })
            }
          })
        }
      })
    })
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
 * Generate conclusions text from extracted causes
 */
export function generateConclusions(
  causas: ExtractedCause[],
  problemContext?: string
): string {
  if (causas.length === 0) return ''

  const parts: string[] = []

  // Add intro based on number of causes
  if (causas.length === 1) {
    parts.push('Del analisis realizado se identifico una causa raiz principal:')
  } else {
    parts.push(`Del analisis realizado se identificaron ${causas.length} causas raiz:`)
  }

  // Group causes by methodology
  const byMethodology: Record<string, ExtractedCause[]> = {}
  causas.forEach((causa) => {
    const key = causa.metodologia || 'Otro'
    if (!byMethodology[key]) byMethodology[key] = []
    byMethodology[key].push(causa)
  })

  // Add summary for each methodology
  Object.entries(byMethodology).forEach(([metodologia, causes]) => {
    parts.push('')
    parts.push(`${metodologia}:`)
    causes.forEach((cause, idx) => {
      parts.push(`${idx + 1}. ${cause.causa_raiz}`)
    })
  })

  // Add problem context if available
  if (problemContext) {
    parts.push('')
    parts.push(`El problema analizado fue: "${problemContext}"`)
  }

  // Add actions summary if any
  const causesWithActions = causas.filter((c) => c.accion_plan)
  if (causesWithActions.length > 0) {
    parts.push('')
    parts.push('Se han propuesto las siguientes acciones correctivas:')
    causesWithActions.forEach((cause, idx) => {
      parts.push(`${idx + 1}. ${cause.accion_plan}`)
    })
  }

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
