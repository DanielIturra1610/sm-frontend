/**
 * Stegmaier Management - API Hooks
 * Custom hooks for API integration with SWR
 */

import useSWR, { type SWRConfiguration, type KeyedMutator } from 'swr'
import { api } from '@/lib/api'
import type {
  // Incidents
  Incident,
  IncidentListParams,
  IncidentListResponse,

  // Companies
  Company,

  // Analysis
  FiveWhysAnalysis,
  FishboneAnalysis,

  // Documents
  Document,
  DocumentListResponse,

  // Auth
  User,
} from '@/shared/types/api'

// ============================================================================
// BASE HOOK TYPES
// ============================================================================

interface UseApiResponse<T> {
  data: T | undefined
  error: Error | undefined
  isLoading: boolean
  isValidating: boolean
  mutate: KeyedMutator<T>
}

interface UseApiListResponse<T> extends UseApiResponse<T> {
  refresh: () => Promise<T | undefined>
}

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

/**
 * Get current user profile
 */
export function useUser(config?: SWRConfiguration) {
  return useSWR<User>(
    '/auth/profile',
    () => api.auth.profile(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config,
    }
  )
}

/**
 * Check if user is authenticated
 */
export function useAuth() {
  const { data: user, error, isLoading, mutate } = useUser({
    shouldRetryOnError: false,
  })

  return {
    user,
    isAuthenticated: !!user && !error,
    isLoading,
    error,
    login: async (credentials: Parameters<typeof api.auth.login>[0]) => {
      const response = await api.auth.login(credentials)
      await mutate(response.user, false)
      return response
    },
    logout: async () => {
      await api.auth.logout()
      await mutate(undefined, false)
    },
    refresh: () => mutate(),
  }
}

// ============================================================================
// COMPANY/TENANT HOOKS
// ============================================================================

/**
 * Get list of user companies
 */
export function useCompanies(config?: SWRConfiguration): UseApiListResponse<Company[]> {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Company[]>(
    '/companies',
    () => api.companies.list(),
    {
      revalidateOnFocus: false,
      ...config,
    }
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  }
}

/**
 * Get specific company by ID
 */
export function useCompany(id: string | null, config?: SWRConfiguration): UseApiResponse<Company> {
  return useSWR<Company>(
    id ? `/companies/${id}` : null,
    id ? () => api.companies.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

// ============================================================================
// INCIDENT HOOKS
// ============================================================================

/**
 * Get list of incidents with optional filtering
 */
export function useIncidents(
  params?: IncidentListParams,
  config?: SWRConfiguration
): UseApiListResponse<IncidentListResponse> {
  const key = params ? ['/incidents', params] : '/incidents'

  const { data, error, isLoading, isValidating, mutate } = useSWR<IncidentListResponse>(
    key,
    () => api.incidents.list(params),
    {
      revalidateOnFocus: false,
      ...config,
    }
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  }
}

/**
 * Get specific incident by ID
 */
export function useIncident(id: string | null, config?: SWRConfiguration): UseApiResponse<Incident> {
  return useSWR<Incident>(
    id ? `/incidents/${id}` : null,
    id ? () => api.incidents.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Create incident with optimistic updates
 */
export function useCreateIncident() {
  const { mutate: mutateIncidents } = useIncidents()

  return {
    createIncident: async (data: Parameters<typeof api.incidents.create>[0]) => {
      const newIncident = await api.incidents.create(data)

      // Optimistically update the incidents list
      await mutateIncidents()

      return newIncident
    },
  }
}

/**
 * Update incident with optimistic updates
 */
export function useUpdateIncident(id: string) {
  const { mutate: mutateIncident } = useIncident(id)
  const { mutate: mutateIncidents } = useIncidents()

  return {
    updateIncident: async (data: Parameters<typeof api.incidents.update>[1]) => {
      const updatedIncident = await api.incidents.update(id, data)

      // Optimistically update both the specific incident and the list
      await mutateIncident(updatedIncident, false)
      await mutateIncidents()

      return updatedIncident
    },
  }
}

// ============================================================================
// ANALYSIS HOOKS
// ============================================================================

/**
 * Get Five Whys analysis by ID
 */
export function useFiveWhysAnalysis(
  id: string | null,
  config?: SWRConfiguration
): UseApiResponse<FiveWhysAnalysis> {
  return useSWR<FiveWhysAnalysis>(
    id ? `/analysis/five-whys/${id}` : null,
    id ? () => api.analysis.fiveWhys.getById(id) : null,
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
): UseApiResponse<FishboneAnalysis> {
  return useSWR<FishboneAnalysis>(
    id ? `/analysis/fishbone/${id}` : null,
    id ? () => api.analysis.fishbone.getById(id) : null,
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
  return {
    createAnalysis: async (data: Parameters<typeof api.analysis.fiveWhys.create>[0]) => {
      return api.analysis.fiveWhys.create(data)
    },
  }
}

/**
 * Create Fishbone analysis
 */
export function useCreateFishboneAnalysis() {
  return {
    createAnalysis: async (data: Parameters<typeof api.analysis.fishbone.create>[0]) => {
      return api.analysis.fishbone.create(data)
    },
  }
}

// ============================================================================
// DOCUMENT HOOKS
// ============================================================================

/**
 * Get list of documents
 */
export function useDocuments(
  params?: { type?: string; status?: string },
  config?: SWRConfiguration
): UseApiListResponse<DocumentListResponse> {
  const key = params ? ['/documents', params] : '/documents'

  const { data, error, isLoading, isValidating, mutate } = useSWR<DocumentListResponse>(
    key,
    () => api.documents.list(params),
    {
      revalidateOnFocus: false,
      ...config,
    }
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh: () => mutate(),
  }
}

/**
 * Get specific document by ID
 */
export function useDocument(id: string | null, config?: SWRConfiguration): UseApiResponse<Document> {
  return useSWR<Document>(
    id ? `/documents/${id}` : null,
    id ? () => api.documents.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Generate document
 */
export function useGenerateDocument() {
  const { mutate: mutateDocuments } = useDocuments()

  return {
    generateDocument: async (request: Parameters<typeof api.documents.generate>[0]) => {
      const document = await api.documents.generate(request)

      // Refresh documents list
      await mutateDocuments()

      return document
    },
  }
}

// ============================================================================
// GENERIC MUTATION HOOKS
// ============================================================================

/**
 * Generic mutation hook for API calls with loading state
 */
export function useMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = async (variables: TVariables): Promise<TData> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await mutationFn(variables)
      setIsLoading(false)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred')
      setError(error)
      setIsLoading(false)
      throw error
    }
  }

  const reset = () => {
    setError(null)
    setIsLoading(false)
  }

  return {
    mutate,
    isLoading,
    error,
    reset,
  }
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to invalidate multiple SWR keys
 */
export function useInvalidateQueries() {
  return {
    invalidateAll: () => {
      // This would require importing mutate from 'swr' globally
      // For now, we'll keep it simple
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    },
    invalidateByPattern: (pattern: string) => {
      // Simple implementation - in a real app you'd use SWR's global mutate
      console.log(`Invalidating pattern: ${pattern}`)
    },
  }
}

// Add React import for useState
import { useState } from 'react'