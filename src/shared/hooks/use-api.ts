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
// INCIDENT HOOKS - MOVED TO incident-hooks.ts
// ============================================================================
// These hooks are now exported from incident-hooks.ts to avoid duplication

// ============================================================================
// ANALYSIS HOOKS - MOVED TO analysis-hooks.ts
// ============================================================================
// These hooks are now exported from analysis-hooks.ts to avoid duplication

// ============================================================================
// DOCUMENT HOOKS - MOVED TO document-hooks.ts
// ============================================================================
// These hooks are now exported from document-hooks.ts to avoid duplication

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