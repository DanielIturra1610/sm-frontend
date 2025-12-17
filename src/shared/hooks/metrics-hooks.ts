import useSWR from 'swr'
import { api } from '@/lib/api'
import type {
  DashboardMetrics,
  FrequencyIndex,
  IncidentsByGroup,
  SafetyPyramid,
  PyramidByZone,
  AccidentsByLeaveType,
  IncidentsByCategory,
  OverdueIncident,
} from '@/lib/api/services/metrics-service'

/**
 * Hook to fetch dashboard overview metrics
 */
export function useDashboardMetrics() {
  return useSWR<DashboardMetrics>(
    '/metrics/dashboard',
    () => api.metrics.getDashboardMetrics(),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  )
}

/**
 * Hook to fetch frequency index KPI
 */
export function useFrequencyIndex() {
  return useSWR<FrequencyIndex>(
    '/metrics/frequency-index',
    () => api.metrics.getFrequencyIndex(),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  )
}

/**
 * Hook to fetch incidents grouped by activity
 */
export function useIncidentsByActivity() {
  return useSWR<IncidentsByGroup[]>(
    '/metrics/by-activity',
    () => api.metrics.getIncidentsByActivity(),
    {
      refreshInterval: 120000, // Refresh every 2 minutes
    }
  )
}

/**
 * Hook to fetch incidents grouped by risk factor
 */
export function useIncidentsByRiskFactor() {
  return useSWR<IncidentsByGroup[]>(
    '/metrics/by-risk-factor',
    () => api.metrics.getIncidentsByRiskFactor(),
    {
      refreshInterval: 120000,
    }
  )
}

/**
 * Hook to fetch incidents grouped by zone
 */
export function useIncidentsByZone() {
  return useSWR<IncidentsByGroup[]>(
    '/metrics/by-zone',
    () => api.metrics.getIncidentsByZone(),
    {
      refreshInterval: 120000,
    }
  )
}

/**
 * Hook to fetch incidents grouped by area
 */
export function useIncidentsByArea() {
  return useSWR<IncidentsByGroup[]>(
    '/metrics/by-area',
    () => api.metrics.getIncidentsByArea(),
    {
      refreshInterval: 120000,
    }
  )
}

/**
 * Hook to fetch incidents grouped by category
 */
export function useIncidentsByCategory() {
  return useSWR<IncidentsByCategory>(
    '/metrics/by-category',
    () => api.metrics.getIncidentsByCategory(),
    {
      refreshInterval: 120000,
    }
  )
}

/**
 * Hook to fetch overdue incidents
 */
export function useOverdueIncidents(limit: number = 10) {
  return useSWR<{ total: number; incidents: OverdueIncident[]; limit: number }>(
    `/metrics/overdue?limit=${limit}`,
    () => api.metrics.getOverdueIncidents(limit),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  )
}

/**
 * Hook to fetch on-time incidents
 */
export function useOnTimeIncidents(limit: number = 10) {
  return useSWR(
    `/metrics/on-time?limit=${limit}`,
    () => api.metrics.getOnTimeIncidents(limit),
    {
      refreshInterval: 120000,
    }
  )
}

/**
 * Hook to fetch safety pyramid metrics
 */
export function useSafetyPyramid() {
  return useSWR<SafetyPyramid>(
    '/metrics/safety-pyramid',
    () => api.metrics.getSafetyPyramid(),
    {
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  )
}

/**
 * Hook to fetch pyramid metrics by zone
 */
export function usePyramidByZone() {
  return useSWR<PyramidByZone[]>(
    '/metrics/pyramid/by-zone',
    () => api.metrics.getPyramidByZone(),
    {
      refreshInterval: 300000,
    }
  )
}

/**
 * Hook to fetch pyramid metrics by area
 */
export function usePyramidByArea() {
  return useSWR<PyramidByZone[]>(
    '/metrics/pyramid/by-area',
    () => api.metrics.getPyramidByArea(),
    {
      refreshInterval: 300000,
    }
  )
}

/**
 * Hook to fetch accidents by leave type
 */
export function useAccidentsByLeaveType() {
  return useSWR<AccidentsByLeaveType>(
    '/metrics/accidents/by-leave-type',
    () => api.metrics.getAccidentsByLeaveType(),
    {
      refreshInterval: 300000,
    }
  )
}

/**
 * Hook to fetch incident trends
 */
export function useIncidentTrends(period: 'month' | 'quarter' | 'year' = 'month') {
  return useSWR(
    `/metrics/trends?period=${period}`,
    () => api.metrics.getIncidentTrends(period),
    {
      refreshInterval: 300000,
    }
  )
}
