/**
 * Hook to extract root causes and generate conclusions from linked analysis reports
 * Used in Final Report creation to auto-populate the Analysis tab
 *
 * UPDATED: Now extracts from ALL linked analyses, not just the first one.
 * See MEJORAS_REPORTE_FINAL.md section 13 for details on the improvements.
 */

import { useMemo } from 'react'
import { useActionPlanReportByIncident } from './report-hooks'
import {
  useMultipleFiveWhysAnalyses,
  useMultipleFishboneAnalyses,
  useMultipleCausalTreeAnalyses,
} from './useMultipleAnalyses'
import {
  extractAllFiveWhysCauses,
  extractAllFishboneCauses,
  extractAllCausalTreeCauses,
  deduplicateCausas,
  generateConclusions,
  type ExtractedCause,
} from '@/shared/utils/finalReportExtractors'
import type { SourceReportsInfo, CausaRaizSummary } from '@/shared/types/api'

interface ExtractedAnalysisData {
  causasRaiz: ExtractedCause[]
  conclusiones: string
  isLoading: boolean
  /** Number of analyses processed per type */
  analysisCount: {
    fiveWhys: number
    fishbone: number
    causalTree: number
  }
}

/**
 * Main hook to extract all analysis data from linked reports
 * Returns root causes and generated conclusions
 *
 * IMPROVEMENTS:
 * - Extracts from ALL linked analyses (not just the first)
 * - Deduplicates similar causes across methodologies
 * - Extracts actions from Fishbone (previously missing)
 * - Better action plan matching
 */
export function useExtractedAnalysisData(
  sourceReports: SourceReportsInfo | null | undefined,
  incidentId?: string | null
): ExtractedAnalysisData {
  // Get ALL IDs from each analysis type
  const fiveWhysIds = sourceReports?.five_whys_ids || []
  const fishboneIds = sourceReports?.fishbone_ids || []
  const causalTreeIds = sourceReports?.causal_tree_ids || []

  // Fetch ALL analyses using new hooks
  const {
    analyses: fiveWhysAnalyses,
    isLoading: loadingFiveWhys,
  } = useMultipleFiveWhysAnalyses(fiveWhysIds)

  const {
    analyses: fishboneAnalyses,
    isLoading: loadingFishbone,
  } = useMultipleFishboneAnalyses(fishboneIds)

  const {
    analyses: causalTreeAnalyses,
    isLoading: loadingCausalTree,
  } = useMultipleCausalTreeAnalyses(causalTreeIds)

  // Extract action plan items to use for filling missing actions
  const { data: actionPlan, isLoading: loadingActionPlan } = useActionPlanReportByIncident(
    incidentId || null
  )

  const actionPlanItems = useMemo(() => {
    if (!actionPlan?.items) return []
    return actionPlan.items.map((item) => ({
      tarea: item.tarea,
      subtarea: item.subtarea,
    }))
  }, [actionPlan])

  // Extract causes from ALL analyses
  const allCauses = useMemo(() => {
    // Extract from each type using the new extractors
    const fiveWhysCauses = extractAllFiveWhysCauses(fiveWhysAnalyses)
    const fishboneCauses = extractAllFishboneCauses(fishboneAnalyses)
    const causalTreeCauses = extractAllCausalTreeCauses(causalTreeAnalyses)

    // Combine all causes
    const combined = [...fiveWhysCauses, ...fishboneCauses, ...causalTreeCauses]

    // Deduplicate similar causes
    const deduplicated = deduplicateCausas(combined)

    // If we have action plan items, try to assign them to causes without actions
    if (actionPlanItems.length > 0 && deduplicated.length > 0) {
      let actionIndex = 0
      return deduplicated.map((cause) => {
        // If cause doesn't have an action and we have more action items available
        if (!cause.accion_plan && actionIndex < actionPlanItems.length) {
          const action = actionPlanItems[actionIndex]
          actionIndex++
          return {
            ...cause,
            accion_plan: action.subtarea
              ? `${action.tarea}: ${action.subtarea}`
              : action.tarea,
          }
        }
        return cause
      })
    }

    return deduplicated
  }, [fiveWhysAnalyses, fishboneAnalyses, causalTreeAnalyses, actionPlanItems])

  // Get problem context for conclusions
  const problemContext = useMemo(() => {
    // Try to get from Five Whys first
    if (fiveWhysAnalyses.length > 0 && fiveWhysAnalyses[0].problemStatement) {
      return fiveWhysAnalyses[0].problemStatement
    }
    // Then from Fishbone
    if (fishboneAnalyses.length > 0 && fishboneAnalyses[0].problem) {
      return fishboneAnalyses[0].problem
    }
    // Then from Causal Tree
    if (causalTreeAnalyses.length > 0) {
      const firstAnalysis = causalTreeAnalyses[0].analysis
      return firstAnalysis.finalEvent || firstAnalysis.title
    }
    return undefined
  }, [fiveWhysAnalyses, fishboneAnalyses, causalTreeAnalyses])

  // Generate conclusions using the utility
  const conclusiones = useMemo(() => {
    return generateConclusions(allCauses, problemContext)
  }, [allCauses, problemContext])

  return {
    causasRaiz: allCauses,
    conclusiones,
    isLoading: loadingFiveWhys || loadingFishbone || loadingCausalTree || loadingActionPlan,
    analysisCount: {
      fiveWhys: fiveWhysAnalyses.length,
      fishbone: fishboneAnalyses.length,
      causalTree: causalTreeAnalyses.length,
    },
  }
}

/**
 * Helper function to convert extracted causes to the form format
 */
export function convertToCausaRaizSummary(
  causes: ExtractedCause[]
): CausaRaizSummary[] {
  return causes.map((c) => ({
    problema: c.problema,
    causa_raiz: c.causa_raiz,
    accion_plan: c.accion_plan || undefined,
    metodologia: c.metodologia || undefined,
  }))
}

// Re-export the type for consumers
export type { ExtractedCause }
