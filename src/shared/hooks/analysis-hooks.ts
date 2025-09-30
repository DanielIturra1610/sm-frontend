/**
 * Stegmaier Management - Analysis Hooks
 * Custom hooks for root cause analysis API integration with SWR
 */

import useSWR, { type SWRConfiguration } from 'swr'
import useSWRMutation from 'swr/mutation'
import { api } from '@/lib/api/modular-client'
import type {
  FiveWhysAnalysis,
  CreateFiveWhysData,
  FishboneAnalysis,
  CreateFishboneData,
  FishboneCause,
  AnalysisTemplate,
  AnalysisReport,
} from '@/shared/types/api'

// ============================================================================
// ANALYSIS HOOKS
// ============================================================================

/**
 * Get Five Whys analysis by ID
 */
export function useFiveWhysAnalysis(
  id: string | null,
  config?: SWRConfiguration
) {
  return useSWR<FiveWhysAnalysis>(
    id ? `/analysis/five-whys/${id}` : null,
    id ? () => api.analysis.getFiveWhysById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get Fishbone analysis by ID
 */
export function useFishboneAnalysis(
  id: string | null,
  config?: SWRConfiguration
) {
  return useSWR<FishboneAnalysis>(
    id ? `/analysis/fishbone/${id}` : null,
    id ? () => api.analysis.getFishboneById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Create Five Whys analysis
 */
export function useCreateFiveWhysAnalysis() {
  return useSWRMutation('/analysis/five-whys',
    async (key, { arg }: { arg: CreateFiveWhysData }) =>
      api.analysis.createFiveWhys(arg)
  )
}

/**
 * Update Five Whys analysis
 */
export function useUpdateFiveWhys(id: string) {
  const { mutate: mutateAnalysis } = useSWR<FiveWhysAnalysis>(`/analysis/five-whys/${id}`)

  return useSWRMutation(`/analysis/five-whys/${id}`,
    async (key, { arg }: { arg: Partial<CreateFiveWhysData> }) => {
      const data = await api.analysis.updateFiveWhys(id, arg)
      // Update the cached data with the response
      await mutateAnalysis(data, false)
      return data
    }
  )
}

/**
 * Create Fishbone analysis
 */
export function useCreateFishboneAnalysis() {
  return useSWRMutation('/analysis/fishbone',
    async (key, { arg }: { arg: CreateFishboneData }) =>
      api.analysis.createFishbone(arg)
  )
}

/**
 * Update Fishbone analysis
 */
export function useUpdateFishbone(id: string) {
  const { mutate: mutateAnalysis } = useSWR<FishboneAnalysis>(`/analysis/fishbone/${id}`)

  return useSWRMutation(`/analysis/fishbone/${id}`,
    async (key, { arg }: { arg: Partial<CreateFishboneData> }) => {
      const data = await api.analysis.updateFishbone(id, arg)
      // Update the cached data with the response
      await mutateAnalysis(data, false)
      return data
    }
  )
}

/**
 * Add causes to Fishbone analysis
 */
export function useAddFishboneCauses(analysisId: string) {
  const { mutate: mutateAnalysis } = useSWR<FishboneAnalysis>(`/analysis/fishbone/${analysisId}`)

  return {
    addCauses: async (causes: FishboneCause[]) => {
      const response = await api.analysis.addFishboneCauses(analysisId, causes)
      
      // Update the cached analysis data
      await mutateAnalysis(response, false)
      
      return response
    }
  }
}

/**
 * Create analysis template
 */
export function useCreateAnalysisTemplate() {
  return useSWRMutation('/analysis/templates',
    async (key, { arg }: { arg: AnalysisTemplate }) =>
      api.analysis.createTemplate(arg)
  )
}

/**
 * Generate analysis report
 */
export function useGenerateAnalysisReport(analysisId: string) {
  return {
    generateReport: async () => {
      return api.analysis.generateReport(analysisId)
    }
  }
}