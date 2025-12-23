/**
 * Hook for managing Express Mode vs Complete Mode in Final Report creation
 *
 * Express Mode: Auto-fills form with extracted data, user reviews and confirms
 * Complete Mode: Traditional form where user fills everything manually
 */

import { useState, useMemo, useCallback } from 'react'
import { useExtractedAnalysisData } from './useExtractedAnalysisData'
import { usePrefillData, useZeroToleranceReport, useActionPlanReportByIncident } from './report-hooks'
import { useCalculatedCosts, type CalculatedCost } from './useCalculatedCosts'
import { useIncidentPhotos } from './attachment-hooks'
import {
  extractFromZeroTolerance,
  consolidarPersonas,
  consolidarEvidencias,
  type PersonaConsolidada,
  type EvidenciaConsolidada,
} from '@/shared/utils/finalReportExtractors'
import {
  generateConclusions,
  generateLessonsLearned,
  generateActionsResume,
} from '@/shared/utils/reportGenerators'
import type { Fotografia } from '@/shared/types/api'

export type ReportMode = 'express' | 'complete'

interface ResponsableData {
  nombre: string
  cargo: string
  rol?: string
}

interface ExpressModeData {
  // From incident/prefill
  empresa: string
  descripcion: string
  lugar: string
  fecha: string
  supervisor: string

  // From analyses
  causasRaiz: Array<{
    problema: string
    causa_raiz: string
    accion_plan: string
    metodologia: string
  }>
  conclusiones: string
  leccionesAprendidas: string[]
  analysisCount: {
    fiveWhys: number
    fishbone: number
    causalTree: number
  }

  // Consolidated data
  personas: PersonaConsolidada[]
  evidencias: EvidenciaConsolidada[]
  responsables: ResponsableData[]

  // Zero Tolerance data
  severidad: string
  acciones_tomadas: string

  // Action plan data
  accionesInmediatasResumen: string
  planAccionResumen: string
  planAccionProgreso: number

  // Calculated costs
  costosCalculados: CalculatedCost[]
  totalCostosEstimado: number

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
    conclusiones: extractedConclusiones,
    analysisCount,
    isLoading: isLoadingAnalysis,
  } = useExtractedAnalysisData(prefillData?.source_reports, incidentId)

  // Fetch Zero Tolerance if available
  const zeroToleranceId = prefillData?.source_reports?.zero_tolerance_id || null
  const { data: zeroToleranceReport, isLoading: isLoadingZT } =
    useZeroToleranceReport(zeroToleranceId)

  // Fetch Action Plan if available
  const { data: actionPlanData, isLoading: isLoadingAP } =
    useActionPlanReportByIncident(incidentId)

  // Calculate costs
  const { costos: costosCalculados, totalEstimado: totalCostosEstimado } = useCalculatedCosts({
    equiposDanados: prefillData?.equipos_danados,
    personasInvolucradas: prefillData?.personas_involucradas,
    actionPlanItems: actionPlanData?.items,
  })

  // Fetch incident photos (including Flash Report attachments)
  const { data: incidentPhotos, isLoading: isLoadingPhotos } = useIncidentPhotos(incidentId)

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

    // Consolidate evidence from all sources
    const prefillFotos: Fotografia[] = prefillData.final_report_data?.imagenes_evidencia?.map(img => ({
      url: img.url,
      descripcion: img.descripcion,
      fecha: img.fecha,
    })) || []
    const ztFotos = zeroToleranceReport?.fotografias || []

    // Convert incident photos to attachment format for consolidation
    const incidentAttachments = (incidentPhotos || []).map((photo) => ({
      url: photo.signed_url || '',
      name: photo.file_name || photo.description || 'Foto del incidente',
      type: photo.mime_type || 'image/jpeg',
    }))

    const evidencias = consolidarEvidencias(prefillFotos, ztFotos, incidentAttachments)

    // Extract responsables - supervisor from Flash Report + any from prefill
    const responsables: ResponsableData[] = []

    // Add supervisor as a responsable
    if (prefillData.supervisor) {
      responsables.push({
        nombre: prefillData.supervisor,
        cargo: 'Supervisor',
        rol: 'Supervisor del area',
      })
    }

    // Add responsables from prefill if available
    if (prefillData.final_report_data?.responsables_investigacion) {
      prefillData.final_report_data.responsables_investigacion.forEach((r) => {
        // Avoid duplicates
        if (!responsables.some((existing) => existing.nombre.toLowerCase() === r.nombre.toLowerCase())) {
          responsables.push({
            nombre: r.nombre,
            cargo: r.cargo || 'Investigador',
            rol: r.rol,
          })
        }
      })
    }

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

    // Generate conclusions if not extracted
    const conclusiones = extractedConclusiones || generateConclusions({
      causasRaiz,
      tipoIncidente: prefillData.tipo || 'incidente',
      personasAfectadas: personas.length,
      equiposDanados: prefillData.equipos_danados?.length || 0,
      severidad: ztData?.severidad,
      accionesTomadas: ztData?.acciones_tomadas,
      planAccionProgreso: actionPlanData?.porcentaje_avance_plan,
    })

    // Generate lessons learned
    const leccionesAprendidas = generateLessonsLearned({
      causasRaiz,
      tipoIncidente: prefillData.tipo,
      accionesCorrectivas: causasRaiz.map((c) => c.accion_plan).filter(Boolean),
    })

    // Generate action resumes
    const { accionesInmediatasResumen, planAccionResumen } = generateActionsResume({
      accionesInmediatas: ztData?.acciones_tomadas || prefillData.acciones_inmediatas,
      actionPlanItems: actionPlanData?.items,
      porcentajeAvance: actionPlanData?.porcentaje_avance_plan,
    })

    return {
      empresa: prefillData.empresa || '',
      descripcion: prefillData.descripcion || '',
      lugar: prefillData.lugar || '',
      fecha: prefillData.fecha || '',
      supervisor: prefillData.supervisor || '',
      causasRaiz: causasRaiz.map((c) => ({
        problema: c.problema,
        causa_raiz: c.causa_raiz,
        accion_plan: c.accion_plan,
        metodologia: c.metodologia,
      })),
      conclusiones,
      leccionesAprendidas,
      analysisCount,
      personas,
      evidencias,
      responsables,
      severidad: ztData?.severidad || '',
      acciones_tomadas: ztData?.acciones_tomadas || '',
      accionesInmediatasResumen,
      planAccionResumen,
      planAccionProgreso: actionPlanData?.porcentaje_avance_plan || 0,
      costosCalculados,
      totalCostosEstimado,
      sourceReportsCount,
      hasEnoughData,
    }
  }, [prefillData, causasRaiz, extractedConclusiones, analysisCount, zeroToleranceReport, actionPlanData, costosCalculados, totalCostosEstimado, incidentPhotos])

  // Calculate data completeness percentage
  const dataCompleteness = useMemo(() => {
    if (!expressData) return 0

    let score = 0
    const maxScore = 15

    // Check each data category
    if (expressData.empresa) score += 1
    if (expressData.descripcion) score += 1
    if (expressData.supervisor) score += 1
    if (expressData.causasRaiz.length > 0) score += 2
    if (expressData.conclusiones) score += 1
    if (expressData.leccionesAprendidas.length > 0) score += 1
    if (expressData.personas.length > 0) score += 2
    if (expressData.evidencias.length > 0) score += 1
    if (expressData.responsables.length > 0) score += 1
    if (expressData.acciones_tomadas) score += 1
    if (expressData.planAccionResumen) score += 1
    if (expressData.costosCalculados.length > 0) score += 1
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
    isLoading: isLoadingPrefill || isLoadingAnalysis || isLoadingZT || isLoadingAP || isLoadingPhotos,
    canUseExpressMode,
    dataCompleteness,
  }
}
