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
import { useIncidentPhotos, useCausalTreeImages } from './attachment-hooks'
import type { EnhancedAttachment } from '@/lib/api/services/attachment-service'
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

interface TerceroData {
  nombre: string
  empresa?: string
  rol: string
}

interface ActionPlanItemSummary {
  tarea: string
  responsable?: string
  estado: string
  avance_real: number
  fin?: string
}

interface ExpressModeData {
  // From incident/prefill
  empresa: string
  descripcion: string
  lugar: string
  fecha: string
  supervisor: string
  // Additional Flash Report identifiers
  areaZona: string
  numeroProdity: string
  zonal: string

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
  terceros: TerceroData[]

  // Zero Tolerance data
  severidad: string
  acciones_tomadas: string

  // Flash Report / Immediate actions data
  accionesInmediatas: string

  // Action plan data
  accionesInmediatasResumen: string
  planAccionResumen: string
  planAccionProgreso: number
  planAccionItems: ActionPlanItemSummary[]

  // Calculated costs
  costosCalculados: CalculatedCost[]
  totalCostosEstimado: number

  // Analysis IDs for links
  causalTreeIds: string[]
  fiveWhysIds: string[]
  fishboneIds: string[]

  // Causal tree diagram images
  causalTreeImages: EnhancedAttachment[]

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

  // Fetch causal tree diagram images
  const { data: causalTreeImages, isLoading: isLoadingCausalImages } = useCausalTreeImages(incidentId)

  // Calculate consolidated data
  const expressData = useMemo<ExpressModeData | null>(() => {
    if (!prefillData) return null

    // Extract Zero Tolerance data
    const ztData = extractFromZeroTolerance(zeroToleranceReport)

    // Consolidate personas from multiple sources
    // Check both direct prefill and final_report_data for personas
    const flashPersonas = prefillData.personas_involucradas || []
    const finalReportPersonas = prefillData.final_report_data?.personas_involucradas || []
    const ztPersonas = ztData?.personas || []
    const immediateResponsables: string[] = [] // Could be extracted from immediate actions if needed

    // Combine flash and final report personas (avoiding duplicates)
    const allFlashPersonas = [...flashPersonas]
    finalReportPersonas.forEach((p) => {
      if (!allFlashPersonas.some((fp) => fp.nombre?.toLowerCase() === p.nombre?.toLowerCase())) {
        allFlashPersonas.push(p)
      }
    })

    const personas = consolidarPersonas(
      allFlashPersonas.map((p) => ({
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
    // Exclude causal tree diagrams from evidence - they are displayed separately
    const incidentAttachments = (incidentPhotos || [])
      .filter((photo) => photo.report_type !== 'causal_tree')
      .map((photo) => ({
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

    // Extract terceros (clients) from Action Plan items
    const terceros: TerceroData[] = []
    if (actionPlanData?.items) {
      // Get unique clients from action plan items
      const uniqueClients = new Set<string>()
      actionPlanData.items.forEach((item) => {
        if (item.cliente && item.cliente.trim()) {
          uniqueClients.add(item.cliente.trim())
        }
      })
      // Add each unique client as a tercero
      uniqueClients.forEach((cliente) => {
        terceros.push({
          nombre: cliente,
          rol: 'Cliente',
        })
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

    // Extract action plan items for display
    const planAccionItems: ActionPlanItemSummary[] = (actionPlanData?.items || []).map((item) => ({
      tarea: item.tarea,
      responsable: item.responsable,
      estado: item.estado,
      avance_real: item.avance_real,
      fin: item.fin,
    }))

    // Get analysis IDs for links (sr already defined above)
    const causalTreeIds = sr?.causal_tree_ids || []
    const fiveWhysIds = sr?.five_whys_ids || []
    const fishboneIds = sr?.fishbone_ids || []

    return {
      empresa: prefillData.empresa || '',
      descripcion: prefillData.descripcion || '',
      lugar: prefillData.lugar || '',
      fecha: prefillData.fecha || '',
      supervisor: prefillData.supervisor || '',
      // Additional Flash Report identifiers
      areaZona: prefillData.area_zona || '',
      numeroProdity: prefillData.numero_prodity || '',
      zonal: prefillData.zonal || '',
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
      terceros,
      severidad: ztData?.severidad || '',
      acciones_tomadas: ztData?.acciones_tomadas || '',
      accionesInmediatas: prefillData.acciones_inmediatas || '',
      accionesInmediatasResumen,
      planAccionResumen,
      planAccionProgreso: actionPlanData?.porcentaje_avance_plan || 0,
      planAccionItems,
      costosCalculados,
      totalCostosEstimado,
      causalTreeIds,
      fiveWhysIds,
      fishboneIds,
      causalTreeImages: causalTreeImages || [],
      sourceReportsCount,
      hasEnoughData,
    }
  }, [prefillData, causasRaiz, extractedConclusiones, analysisCount, zeroToleranceReport, actionPlanData, costosCalculados, totalCostosEstimado, incidentPhotos, causalTreeImages])

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
    isLoading: isLoadingPrefill || isLoadingAnalysis || isLoadingZT || isLoadingAP || isLoadingPhotos || isLoadingCausalImages,
    canUseExpressMode,
    dataCompleteness,
  }
}
