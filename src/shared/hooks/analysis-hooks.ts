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
  WhyEntry,
  AddWhyEntryData,
  UpdateWhyEntryData,
  FiveWhysActionItem,
  AddActionItemData,
  UpdateActionItemData,
  FishboneAnalysis,
  CreateFishboneData,
  FishboneCause,
  AnalysisTemplate,
  AnalysisReport,
} from '@/shared/types/api'

// ============================================================================
// LIST HOOKS
// ============================================================================

/**
 * List all Fishbone analyses
 */
export function useFishboneAnalyses(
  params?: { status?: string; search?: string },
  config?: SWRConfiguration
) {
  return useSWR<FishboneAnalysis[]>(
    ['/analysis/fishbone', params],
    () => api.analysis.listFishbone(params),
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * List all Five Whys analyses
 */
export function useFiveWhysAnalyses(
  params?: { status?: string; search?: string },
  config?: SWRConfiguration
) {
  return useSWR<FiveWhysAnalysis[]>(
    ['/analysis/five-whys', params],
    () => api.analysis.listFiveWhys(params),
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

// ============================================================================
// DETAIL HOOKS
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
 * Delete Fishbone analysis
 */
export function useDeleteFishboneAnalysis() {
  const { mutate: mutateList } = useSWR<FishboneAnalysis[]>(['/analysis/fishbone', undefined])

  return useSWRMutation('/analysis/fishbone/delete',
    async (key, { arg }: { arg: string }) => {
      await api.analysis.deleteFishbone(arg)
      // Revalidate the list
      await mutateList()
    }
  )
}

/**
 * Delete Five Whys analysis
 */
export function useDeleteFiveWhysAnalysis() {
  const { mutate: mutateList } = useSWR<FiveWhysAnalysis[]>(['/analysis/five-whys', undefined])

  return useSWRMutation('/analysis/five-whys/delete',
    async (key, { arg }: { arg: string }) => {
      await api.analysis.deleteFiveWhys(arg)
      // Revalidate the list
      await mutateList()
    }
  )
}

/**
 * Add a single cause to Fishbone analysis
 */
export function useAddFishboneCause(analysisId: string) {
  const { mutate: mutateAnalysis } = useSWR<FishboneAnalysis>(`/analysis/fishbone/${analysisId}`)

  return useSWRMutation(`/analysis/fishbone/${analysisId}/causes`,
    async (key, { arg }: { arg: { category: string; description: string; impact?: string; likelihood?: string; priority?: number; subCauses?: string[] } }) => {
      // Add the main cause
      const response = await api.analysis.addFishboneCause(analysisId, {
        category: arg.category,
        description: arg.description,
        impact: arg.impact || 'medium',
        likelihood: arg.likelihood || 'medium',
        priority: arg.priority || 5,
        level: 1,
      })

      // If there are sub-causes, add them as level 2 causes with parent reference
      if (arg.subCauses && arg.subCauses.length > 0) {
        for (const subCause of arg.subCauses) {
          if (subCause.trim()) {
            await api.analysis.addFishboneCause(analysisId, {
              category: arg.category,
              description: subCause.trim(),
              level: 2,
              parentId: response.id,
            })
          }
        }
      }

      // Revalidate the analysis to get all causes
      await mutateAnalysis()
      return response
    }
  )
}

/**
 * Update a cause in Fishbone analysis
 */
export function useUpdateFishboneCause(analysisId: string) {
  const { mutate: mutateAnalysis } = useSWR<FishboneAnalysis>(`/analysis/fishbone/${analysisId}`)

  return useSWRMutation(`/analysis/fishbone/${analysisId}/causes/update`,
    async (key, { arg }: { arg: { causeId: string; description?: string; impact?: string; likelihood?: string; priority?: number; notes?: string } }) => {
      const response = await api.analysis.updateFishboneCause(analysisId, arg.causeId, {
        description: arg.description,
        impact: arg.impact,
        likelihood: arg.likelihood,
        priority: arg.priority,
        notes: arg.notes,
      })
      await mutateAnalysis()
      return response
    }
  )
}

/**
 * Delete a cause from Fishbone analysis
 */
export function useDeleteFishboneCause(analysisId: string) {
  const { mutate: mutateAnalysis } = useSWR<FishboneAnalysis>(`/analysis/fishbone/${analysisId}`)

  return useSWRMutation(`/analysis/fishbone/${analysisId}/causes/delete`,
    async (key, { arg }: { arg: string }) => {
      await api.analysis.deleteFishboneCause(analysisId, arg)
      await mutateAnalysis()
    }
  )
}

// ============================================================================
// FIVE WHYS - WHY ENTRIES
// ============================================================================

/**
 * Add why entry to Five Whys analysis
 */
export function useAddWhyEntry(analysisId: string) {
  const { mutate: mutateAnalysis } = useSWR<FiveWhysAnalysis>(`/analysis/five-whys/${analysisId}`)

  return useSWRMutation(`/analysis/five-whys/${analysisId}/whys`,
    async (key, { arg }: { arg: AddWhyEntryData }) => {
      const entry = await api.analysis.addWhyEntry(analysisId, arg)
      // Revalidate the analysis to get updated whys array
      await mutateAnalysis()
      return entry
    }
  )
}

/**
 * Update why entry
 */
export function useUpdateWhyEntry(analysisId: string) {
  const { mutate: mutateAnalysis } = useSWR<FiveWhysAnalysis>(`/analysis/five-whys/${analysisId}`)

  return useSWRMutation(`/analysis/five-whys/${analysisId}/whys`,
    async (key, { arg }: { arg: { entryId: string; data: UpdateWhyEntryData } }) => {
      const entry = await api.analysis.updateWhyEntry(analysisId, arg.entryId, arg.data)
      // Revalidate the analysis to get updated whys array
      await mutateAnalysis()
      return entry
    }
  )
}

/**
 * Delete why entry
 */
export function useDeleteWhyEntry(analysisId: string) {
  const { mutate: mutateAnalysis } = useSWR<FiveWhysAnalysis>(`/analysis/five-whys/${analysisId}`)

  return useSWRMutation(`/analysis/five-whys/${analysisId}/whys`,
    async (key, { arg }: { arg: string }) => {
      await api.analysis.deleteWhyEntry(analysisId, arg)
      // Revalidate the analysis to get updated whys array
      await mutateAnalysis()
    }
  )
}

// ============================================================================
// FIVE WHYS - ACTION ITEMS
// ============================================================================

/**
 * Add action item to Five Whys analysis
 */
export function useAddFiveWhysActionItem(analysisId: string) {
  const { mutate: mutateAnalysis } = useSWR<FiveWhysAnalysis>(`/analysis/five-whys/${analysisId}`)

  return useSWRMutation(`/analysis/five-whys/${analysisId}/action-items`,
    async (key, { arg }: { arg: AddActionItemData }) => {
      const item = await api.analysis.addFiveWhysActionItem(analysisId, arg)
      // Revalidate the analysis to get updated action items array
      await mutateAnalysis()
      return item
    }
  )
}

/**
 * Update Five Whys action item
 */
export function useUpdateFiveWhysActionItem(analysisId: string) {
  const { mutate: mutateAnalysis } = useSWR<FiveWhysAnalysis>(`/analysis/five-whys/${analysisId}`)

  return useSWRMutation(`/analysis/five-whys/${analysisId}/action-items`,
    async (key, { arg }: { arg: { itemId: string; data: UpdateActionItemData } }) => {
      const item = await api.analysis.updateFiveWhysActionItem(analysisId, arg.itemId, arg.data)
      // Revalidate the analysis to get updated action items array
      await mutateAnalysis()
      return item
    }
  )
}

/**
 * Delete Five Whys action item
 */
export function useDeleteFiveWhysActionItem(analysisId: string) {
  const { mutate: mutateAnalysis } = useSWR<FiveWhysAnalysis>(`/analysis/five-whys/${analysisId}`)

  return useSWRMutation(`/analysis/five-whys/${analysisId}/action-items`,
    async (key, { arg }: { arg: string }) => {
      await api.analysis.deleteFiveWhysActionItem(analysisId, arg)
      // Revalidate the analysis to get updated action items array
      await mutateAnalysis()
    }
  )
}

// ============================================================================
// TEMPLATES & REPORTS
// ============================================================================

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