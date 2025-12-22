/**
 * Stegmaier Management - Incident Hooks
 * Custom hooks for incident management API integration with SWR
 */

import useSWR, { type SWRConfiguration, type KeyedMutator, useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'
import { api } from '@/lib/api/modular-client'
import type {
  Incident,
  IncidentListParams,
  IncidentListResponse,
  IncidentStats,
  IncidentTrends,
  IncidentExportRequest,
  UpdateIncidentData,
  CreateIncidentData,
} from '@/shared/types/api'

// ============================================================================
// INCIDENT HOOKS
// ============================================================================

/**
 * Get list of incidents with optional filtering
 */
export function useIncidents(
  params?: IncidentListParams,
  config?: SWRConfiguration
): { data: IncidentListResponse | undefined; error: Error | undefined; isLoading: boolean; isValidating: boolean; mutate: KeyedMutator<IncidentListResponse> } {
  const key = params ? ['/incidents', params] : '/incidents'

  const { data, error, isLoading, isValidating, mutate } = useSWR<IncidentListResponse>(
    key,
    () => api.incident.list(params),
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
  }
}

/**
 * Get specific incident by ID
 */
export function useIncident(id: string | null, config?: SWRConfiguration) {
  return useSWR<Incident>(
    id ? `/incidents/${id}` : null,
    id ? () => api.incident.getById(id) : null,
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

  return useSWRMutation<Incident, Error, string, CreateIncidentData>('/incidents',
    async (key, { arg }) => {
      const newIncident = await api.incident.create(arg)
      // Optimistically update the incidents list
      await mutateIncidents()
      return newIncident
    }
  )
}

/**
 * Update incident with optimistic updates
 */
export function useUpdateIncident(id: string) {
  const { mutate: mutateIncident } = useIncident(id)
  const { mutate: mutateIncidents } = useIncidents()

  return useSWRMutation<Incident, Error, string, UpdateIncidentData>(`/incidents/${id}`,
    async (key, { arg }) => {
      const updatedIncident = await api.incident.update(id, arg)

      // Optimistically update both the specific incident and the list
      await mutateIncident(updatedIncident, false)
      await mutateIncidents()

      return updatedIncident
    }
  )
}

/**
 * Submit incident for review
 */
export function useSubmitIncident(id: string) {
  const { mutate: mutateIncident } = useIncident(id)
  const { mutate: mutateIncidents } = useIncidents()

  return {
    submitIncident: async () => {
      const response = await api.incident.submit(id)
      
      // Update both the specific incident and the list
      await mutateIncident(response, false)
      await mutateIncidents()
      
      return response
    }
  }
}

/**
 * Start investigation on incident
 */
export function useStartInvestigation(id: string) {
  return {
    startInvestigation: async () => {
      return api.incident.investigate(id)
    }
  }
}

/**
 * Complete investigation on incident
 */
export function useCompleteInvestigation(id: string) {
  return {
    completeInvestigation: async () => {
      return api.incident.complete(id)
    }
  }
}

/**
 * Get incident statistics
 */
export function useIncidentStats(config?: SWRConfiguration) {
  return useSWR<IncidentStats>(
    '/incidents/statistics',
    () => api.incident.getStats(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config,
    }
  )
}

/**
 * Get incident trends
 */
export function useIncidentTrends(config?: SWRConfiguration) {
  return useSWR<IncidentTrends>(
    '/incidents/trends',
    () => api.incident.getTrends(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config,
    }
  )
}

/**
 * Export incidents
 */
export function useExportIncidents() {
  return useSWRMutation('/incidents/export',
    async (key, { arg }: { arg: IncidentExportRequest }) =>
      api.incident.export(arg)
  )
}

/**
 * Delete incident with cache invalidation
 * Uses SWRMutation for optimistic updates and proper error handling
 */
export function useDeleteIncident() {
  const { mutate } = useSWRConfig()

  return useSWRMutation<void, Error, string, string>(
    '/incidents/delete',
    async (key, { arg: id }) => {
      await api.incident.delete(id)
      // Invalidate all incident-related cache entries (with any filter params)
      await mutate(
        (cacheKey) => {
          if (typeof cacheKey === 'string') {
            return cacheKey.startsWith('/incidents')
          }
          if (Array.isArray(cacheKey) && cacheKey.length > 0) {
            return cacheKey[0] === '/incidents'
          }
          return false
        },
        undefined,
        { revalidate: true }
      )
    }
  )
}