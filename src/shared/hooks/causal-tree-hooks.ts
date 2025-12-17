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
      return api.analysis.listCausalTree(filter)
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
      return api.analysis.getCausalTreeById(analysisId)
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
      return api.analysis.getCausalTreeNodes(analysisId)
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
      return api.analysis.getCausalTreeMeasures(analysisId)
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
      return api.analysis.validateCausalTree(analysisId, {
        checkObjectivity: true,
        checkLogic: true,
        checkMeasures: true,
      })
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
      return api.analysis.createCausalTree(data)
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
      return api.analysis.updateCausalTree(analysisId, data)
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
      return api.analysis.deleteCausalTree(analysisId)
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
      return api.analysis.addCausalTreeNode(data.analysisId, data)
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
      return api.analysis.updateCausalTreeNode(analysisId, nodeId, data)
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
      return api.analysis.deleteCausalTreeNode(analysisId, nodeId)
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
      return api.analysis.markNodeAsRootCause(analysisId, nodeId)
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
      return api.analysis.addCausalTreeMeasure(data.analysisId, data)
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
      return api.analysis.updateCausalTreeMeasure(analysisId, measureId, data)
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
      return api.analysis.deleteCausalTreeMeasure(analysisId, measureId)
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
    mutationFn: async ({ analysisId, rootCauses }: { analysisId: string; rootCauses?: string[] }) => {
      return api.analysis.completeCausalTree(analysisId, rootCauses)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analysis', variables.analysisId] })
      queryClient.invalidateQueries({ queryKey: ['causal-tree-analyses'] })
    },
  })
}
