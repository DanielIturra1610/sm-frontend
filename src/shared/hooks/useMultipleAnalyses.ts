/**
 * Stegmaier Management - Multiple Analyses Hooks
 * Hooks for loading multiple analyses by IDs for Final Report data extraction
 *
 * These hooks solve the limitation where only the first analysis was being processed.
 * Now all linked analyses can be extracted for the Final Report.
 */

import useSWR from 'swr'
import { api } from '@/lib/api/modular-client'
import type { FiveWhysAnalysis, FishboneAnalysis } from '@/shared/types/api'
import type { CausalTreeAnalysis, CausalNode, PreventiveMeasure } from '@/shared/types/causal-tree'

// ============================================================================
// MULTIPLE FIVE WHYS ANALYSES
// ============================================================================

interface MultipleFiveWhysResult {
  analyses: FiveWhysAnalysis[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch multiple Five Whys analyses by their IDs
 * Used in Final Report to extract root causes from ALL linked analyses
 */
export function useMultipleFiveWhysAnalyses(ids: string[]): MultipleFiveWhysResult {
  const validIds = ids.filter(Boolean)

  const { data, error, isLoading } = useSWR<FiveWhysAnalysis[]>(
    validIds.length > 0 ? ['five-whys-multiple', ...validIds] : null,
    async () => {
      const results = await Promise.all(
        validIds.map(id => api.analysis.getFiveWhysById(id))
      )
      return results
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    analyses: data || [],
    isLoading,
    error: error || null,
  }
}

// ============================================================================
// MULTIPLE FISHBONE ANALYSES
// ============================================================================

interface MultipleFishboneResult {
  analyses: FishboneAnalysis[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch multiple Fishbone analyses by their IDs
 * Used in Final Report to extract root causes from ALL linked analyses
 */
export function useMultipleFishboneAnalyses(ids: string[]): MultipleFishboneResult {
  const validIds = ids.filter(Boolean)

  const { data, error, isLoading } = useSWR<FishboneAnalysis[]>(
    validIds.length > 0 ? ['fishbone-multiple', ...validIds] : null,
    async () => {
      const results = await Promise.all(
        validIds.map(id => api.analysis.getFishboneById(id))
      )
      return results
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    analyses: data || [],
    isLoading,
    error: error || null,
  }
}

// ============================================================================
// MULTIPLE CAUSAL TREE ANALYSES
// ============================================================================

interface CausalTreeWithDetails {
  analysis: CausalTreeAnalysis
  nodes: CausalNode[]
  measures: PreventiveMeasure[]
}

interface MultipleCausalTreeResult {
  analyses: CausalTreeWithDetails[]
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to fetch multiple Causal Tree analyses with their nodes and measures
 * Used in Final Report to extract root causes from ALL linked analyses
 *
 * Note: This uses SWR to maintain consistency with other hooks in the project.
 * See DEUDA_TECNICA.md for context on the React Query vs SWR situation.
 */
export function useMultipleCausalTreeAnalyses(ids: string[]): MultipleCausalTreeResult {
  const validIds = ids.filter(Boolean)

  const { data, error, isLoading } = useSWR<CausalTreeWithDetails[]>(
    validIds.length > 0 ? ['causal-tree-multiple', ...validIds] : null,
    async () => {
      const results = await Promise.all(
        validIds.map(async (id) => {
          const [analysis, nodes, measures] = await Promise.all([
            api.analysis.getCausalTreeById(id),
            api.analysis.getCausalTreeNodes(id),
            api.analysis.getCausalTreeMeasures(id),
          ])
          return { analysis, nodes, measures }
        })
      )
      return results
    },
    {
      revalidateOnFocus: false,
    }
  )

  return {
    analyses: data || [],
    isLoading,
    error: error || null,
  }
}

// ============================================================================
// COMBINED ANALYSES HOOK
// ============================================================================

interface AllAnalysesResult {
  fiveWhys: FiveWhysAnalysis[]
  fishbone: FishboneAnalysis[]
  causalTree: CausalTreeWithDetails[]
  isLoading: boolean
  hasAnyAnalysis: boolean
}

/**
 * Combined hook to fetch all types of analyses at once
 * Useful for Final Report generation where all analyses are needed
 */
export function useAllLinkedAnalyses(
  fiveWhysIds: string[],
  fishboneIds: string[],
  causalTreeIds: string[]
): AllAnalysesResult {
  const fiveWhysResult = useMultipleFiveWhysAnalyses(fiveWhysIds)
  const fishboneResult = useMultipleFishboneAnalyses(fishboneIds)
  const causalTreeResult = useMultipleCausalTreeAnalyses(causalTreeIds)

  return {
    fiveWhys: fiveWhysResult.analyses,
    fishbone: fishboneResult.analyses,
    causalTree: causalTreeResult.analyses,
    isLoading: fiveWhysResult.isLoading || fishboneResult.isLoading || causalTreeResult.isLoading,
    hasAnyAnalysis:
      fiveWhysResult.analyses.length > 0 ||
      fishboneResult.analyses.length > 0 ||
      causalTreeResult.analyses.length > 0,
  }
}
