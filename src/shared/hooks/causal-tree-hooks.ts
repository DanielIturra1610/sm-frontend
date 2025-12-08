import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  CausalTreeAnalysis,
  CausalTreeAnalysisListResponse,
  CausalTreeAnalysisFilter,
  CreateCausalTreeAnalysisDTO,
  UpdateCausalTreeAnalysisDTO,
  AddCausalNodeDTO,
  UpdateCausalNodeDTO,
  AddPreventiveMeasureDTO,
  UpdatePreventiveMeasureDTO,
  CausalNode,
  PreventiveMeasure,
  CausalTreeValidation,
} from '@/shared/types/causal-tree'

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch list of causal tree analyses
 */
export function useCausalTreeAnalyses(filter?: CausalTreeAnalysisFilter) {
  return useQuery<CausalTreeAnalysisListResponse>({
    queryKey: ['causal-tree-analyses', filter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filter?.incidentId) params.append('incidentId', filter.incidentId)
      if (filter?.status) params.append('status', filter.status)
      if (filter?.limit) params.append('limit', filter.limit.toString())
      if (filter?.offset) params.append('offset', filter.offset.toString())

      const response = await api.get(`/analysis/causal-tree?${params}`)
      return response.data
    },
  })
}

/**
 * Hook to fetch a single causal tree analysis
 */
export function useCausalTreeAnalysis(analysisId: string | null) {
  return useQuery<CausalTreeAnalysis>({
    queryKey: ['causal-tree-analysis', analysisId],
    queryFn: async () => {
      if (!analysisId) throw new Error('Analysis ID is required')
      const response = await api.get(`/analysis/causal-tree/${analysisId}`)
      return response.data
    },
    enabled: !!analysisId,
  })
}

/**
 * Hook to fetch nodes for an analysis
 */
export function useCausalTreeNodes(analysisId: string | null) {
  return useQuery<CausalNode[]>({
    queryKey: ['causal-tree-nodes', analysisId],
    queryFn: async () => {
      if (!analysisId) throw new Error('Analysis ID is required')
      const response = await api.get(`/analysis/causal-tree/${analysisId}/nodes`)
      return response.data
    },
    enabled: !!analysisId,
  })
}

/**
 * Hook to fetch preventive measures for an analysis
 */
export function useCausalTreeMeasures(analysisId: string | null) {
  return useQuery<PreventiveMeasure[]>({
    queryKey: ['causal-tree-measures', analysisId],
    queryFn: async () => {
      if (!analysisId) throw new Error('Analysis ID is required')
      const response = await api.get(`/analysis/causal-tree/${analysisId}/measures`)
      return response.data
    },
    enabled: !!analysisId,
  })
}

/**
 * Hook to validate a causal tree analysis
 */
export function useCausalTreeValidation(analysisId: string | null) {
  return useQuery<CausalTreeValidation>({
    queryKey: ['causal-tree-validation', analysisId],
    queryFn: async () => {
      if (!analysisId) throw new Error('Analysis ID is required')
      const response = await api.post(`/analysis/causal-tree/${analysisId}/validate`, {
        checkObjectivity: true,
        checkLogic: true,
        checkMeasures: true,
      })
      return response.data
    },
    enabled: !!analysisId,
  })
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to create a new causal tree analysis
 */
export function useCreateCausalTreeAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCausalTreeAnalysisDTO) => {
      const response = await api.post('/analysis/causal-tree', data)
      return response.data as CausalTreeAnalysis
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analyses'] })
    },
  })
}

/**
 * Hook to update a causal tree analysis
 */
export function useUpdateCausalTreeAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ analysisId, data }: { analysisId: string; data: UpdateCausalTreeAnalysisDTO }) => {
      const response = await api.put(`/analysis/causal-tree/${analysisId}`, data)
      return response.data as CausalTreeAnalysis
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analysis', variables.analysisId] })
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analyses'] })
    },
  })
}

/**
 * Hook to delete a causal tree analysis
 */
export function useDeleteCausalTreeAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (analysisId: string) => {
      await api.delete(`/analysis/causal-tree/${analysisId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analyses'] })
    },
  })
}

/**
 * Hook to add a node to the causal tree
 */
export function useAddCausalNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AddCausalNodeDTO) => {
      const response = await api.post(`/analysis/causal-tree/${data.analysisId}/nodes`, data)
      return response.data as CausalNode
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-nodes', variables.analysisId] })
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analysis', variables.analysisId] })
    },
  })
}

/**
 * Hook to update a causal node
 */
export function useUpdateCausalNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ analysisId, nodeId, data }: { analysisId: string; nodeId: string; data: UpdateCausalNodeDTO }) => {
      const response = await api.put(`/analysis/causal-tree/${analysisId}/nodes/${nodeId}`, data)
      return response.data as CausalNode
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-nodes', variables.analysisId] })
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analysis', variables.analysisId] })
    },
  })
}

/**
 * Hook to delete a causal node
 */
export function useDeleteCausalNode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ analysisId, nodeId }: { analysisId: string; nodeId: string }) => {
      await api.delete(`/analysis/causal-tree/${analysisId}/nodes/${nodeId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-nodes', variables.analysisId] })
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analysis', variables.analysisId] })
    },
  })
}

/**
 * Hook to mark a node as root cause
 */
export function useMarkAsRootCause() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ analysisId, nodeId }: { analysisId: string; nodeId: string }) => {
      const response = await api.post(`/analysis/causal-tree/${analysisId}/nodes/${nodeId}/mark-root-cause`)
      return response.data as CausalNode
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-nodes', variables.analysisId] })
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analysis', variables.analysisId] })
    },
  })
}

/**
 * Hook to add a preventive measure
 */
export function useAddPreventiveMeasure() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AddPreventiveMeasureDTO) => {
      const response = await api.post(`/analysis/causal-tree/${data.analysisId}/measures`, data)
      return response.data as PreventiveMeasure
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-measures', variables.analysisId] })
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analysis', variables.analysisId] })
    },
  })
}

/**
 * Hook to update a preventive measure
 */
export function useUpdatePreventiveMeasure() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ analysisId, measureId, data }: { analysisId: string; measureId: string; data: UpdatePreventiveMeasureDTO }) => {
      const response = await api.put(`/analysis/causal-tree/${analysisId}/measures/${measureId}`, data)
      return response.data as PreventiveMeasure
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-measures', variables.analysisId] })
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analysis', variables.analysisId] })
    },
  })
}

/**
 * Hook to delete a preventive measure
 */
export function useDeletePreventiveMeasure() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ analysisId, measureId }: { analysisId: string; measureId: string }) => {
      await api.delete(`/analysis/causal-tree/${analysisId}/measures/${measureId}`)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-measures', variables.analysisId] })
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analysis', variables.analysisId] })
    },
  })
}

/**
 * Hook to complete a causal tree analysis
 */
export function useCompleteCausalTreeAnalysis() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (analysisId: string) => {
      const response = await api.post(`/analysis/causal-tree/${analysisId}/complete`)
      return response.data as CausalTreeAnalysis
    },
    onSuccess: (_, analysisId) => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analysis', analysisId] })
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analyses'] })
    },
  })
}
