/**
 * Hook for managing Express Mode vs Complete Mode in Final Report creation
 *
 * Express Mode: Auto-fills form with extracted data, user reviews and confirms
 * Complete Mode: Traditional form where user fills everything manually
 */

import { useState, useMemo, useCallback } from 'react'
import { useExtractedAnalysisData } from './useExtractedAnalysisData'
import { usePrefillData, useZeroToleranceReport } from './report-hooks'
import {
  extractFromZeroTolerance,
  consolidarPersonas,
  consolidarEvidencias,
  type PersonaConsolidada,
  type EvidenciaConsolidada,
} from '@/shared/utils/finalReportExtractors'
import type { SourceReportsInfo, Fotografia } from '@/shared/types/api'

export type ReportMode = 'express' | 'complete'

interface ExpressModeData {
  // From incident/prefill
  empresa: string
  descripcion: string
  lugar: string
  fecha: string

  // From analyses
  causasRaiz: Array<{
    problema: string
    causa_raiz: string
    accion_plan: string
    metodologia: string
  }>
  conclusiones: string
  analysisCount: {
    fiveWhys: number
    fishbone: number
    causalTree: number
  }

  // Consolidated data
  personas: PersonaConsolidada[]
  evidencias: EvidenciaConsolidada[]

  // Zero Tolerance data
  severidad: string
  acciones_tomadas: string

  // Metadata
  sourceReportsCount: number
  hasEnoughData: boolean
}

interface UseExpressModeResult {
  mode: ReportMode
  setMode: (mode: ReportMode) => void
  toggleMode: () => void
  expressData: ExpressModeData | null
  isLoading: boolean
  canUseExpressMode: boolean
  dataCompleteness: number // 0-100 percentage
}

/**
 * Hook to manage Express Mode for Final Report creation
 */
export function useExpressMode(incidentId: string | null): UseExpressModeResult {
  const [mode, setMode] = useState<ReportMode>('complete')

  // Fetch all data sources
  const { data: prefillData, isLoading: isLoadingPrefill } = usePrefillData(
    incidentId,
    'final-report'
  )

  const {
    causasRaiz,
    conclusiones,
    analysisCount,
    isLoading: isLoadingAnalysis,
  } = useExtractedAnalysisData(prefillData?.source_reports, incidentId)

  // Fetch Zero Tolerance if available
  const zeroToleranceId = prefillData?.source_reports?.zero_tolerance_id || null
  const { data: zeroToleranceReport, isLoading: isLoadingZT } =
    useZeroToleranceReport(zeroToleranceId)

  // Calculate consolidated data
  const expressData = useMemo<ExpressModeData | null>(() => {
    if (!prefillData) return null

    // Extract Zero Tolerance data
    const ztData = extractFromZeroTolerance(zeroToleranceReport)

    // Consolidate personas from multiple sources
    const flashPersonas = prefillData.personas_involucradas || []
    const ztPersonas = ztData?.personas || []
    const immediateResponsables: string[] = [] // Could be extracted from immediate actions if needed

    const personas = consolidarPersonas(
      flashPersonas.map((p) => ({
        nombre: p.nombre,
        cargo: p.cargo,
        empresa: p.empresa,
        tipo_lesion: p.tipo_lesion,
      })),
      ztPersonas.map((p) => ({
        nombre: p.nombre,
        cargo: p.cargo,
        empresa: p.empresa,
      })),
      immediateResponsables
    )

    // Consolidate evidence
    const flashFotos: Fotografia[] = prefillData.final_report_data?.imagenes_evidencia?.map(img => ({
      url: img.url,
      descripcion: img.descripcion,
    })) || []
    const ztFotos = zeroToleranceReport?.fotografias || []

    const evidencias = consolidarEvidencias(flashFotos, ztFotos, [])

    // Count source reports
    const sr = prefillData.source_reports
    let sourceReportsCount = 0
    if (sr) {
      if (sr.flash_report_id) sourceReportsCount++
      if (sr.immediate_actions_id) sourceReportsCount++
      if (sr.root_cause_id) sourceReportsCount++
      if (sr.action_plan_id) sourceReportsCount++
      if (sr.zero_tolerance_id) sourceReportsCount++
      sourceReportsCount += (sr.five_whys_ids?.length || 0)
      sourceReportsCount += (sr.fishbone_ids?.length || 0)
      sourceReportsCount += (sr.causal_tree_ids?.length || 0)
    }

    // Determine if we have enough data for express mode
    const hasEnoughData =
      sourceReportsCount >= 2 && // At least 2 source reports
      (causasRaiz.length > 0 || personas.length > 0) // And some extracted data

    return {
      empresa: prefillData.empresa || '',
      descripcion: prefillData.descripcion || '',
      lugar: prefillData.lugar || '',
      fecha: prefillData.fecha || '',
      causasRaiz: causasRaiz.map((c) => ({
        problema: c.problema,
        causa_raiz: c.causa_raiz,
        accion_plan: c.accion_plan,
        metodologia: c.metodologia,
      })),
      conclusiones,
      analysisCount,
      personas,
      evidencias,
      severidad: ztData?.severidad || '',
      acciones_tomadas: ztData?.acciones_tomadas || '',
      sourceReportsCount,
      hasEnoughData,
    }
  }, [prefillData, causasRaiz, conclusiones, analysisCount, zeroToleranceReport])

  // Calculate data completeness percentage
  const dataCompleteness = useMemo(() => {
    if (!expressData) return 0

    let score = 0
    const maxScore = 10

    // Check each data category
    if (expressData.empresa) score += 1
    if (expressData.descripcion) score += 1
    if (expressData.causasRaiz.length > 0) score += 2
    if (expressData.conclusiones) score += 1
    if (expressData.personas.length > 0) score += 2
    if (expressData.evidencias.length > 0) score += 1
    if (expressData.acciones_tomadas) score += 1
    if (expressData.sourceReportsCount >= 3) score += 1

    return Math.round((score / maxScore) * 100)
  }, [expressData])

  // Can use express mode only if we have enough data
  const canUseExpressMode = expressData?.hasEnoughData || false

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'express' ? 'complete' : 'express'))
  }, [])

  return {
    mode,
    setMode,
    toggleMode,
    expressData,
    isLoading: isLoadingPrefill || isLoadingAnalysis || isLoadingZT,
    canUseExpressMode,
    dataCompleteness,
  }
}
