/**
 * Stegmaier Management - SLA Hooks
 * Custom hooks for SLA (Service Level Agreement) management
 */

import useSWR, { type SWRConfiguration, type KeyedMutator } from 'swr'
import { useState, useCallback, useMemo } from 'react'
import { api } from '@/lib/api'
import type {
  SLAConfiguration,
  SLAConfigurationListResponse,
  CreateSLAConfigurationData,
  UpdateSLAConfigurationData,
  SLAReportType,
  SLAStatus,
  CalculateSLAInput,
  SLACalculationResult,
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
// SLA CONFIGURATION HOOKS
// ============================================================================

/**
 * Get all SLA configurations for the current tenant
 */
export function useSLAConfigurations(config?: SWRConfiguration): UseApiListResponse<SLAConfiguration[]> {
  const { data, error, isLoading, isValidating, mutate } = useSWR<SLAConfiguration[]>(
    '/sla/configurations',
    () => api.sla.list(),
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
 * Get SLA configuration by ID
 */
export function useSLAConfiguration(id: string | null, config?: SWRConfiguration): UseApiResponse<SLAConfiguration> {
  return useSWR<SLAConfiguration>(
    id ? `/sla/configurations/${id}` : null,
    id ? () => api.sla.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get SLA configuration by report type
 */
export function useSLAConfigurationByType(
  reportType: SLAReportType | null,
  config?: SWRConfiguration
): UseApiResponse<SLAConfiguration> {
  return useSWR<SLAConfiguration>(
    reportType ? `/sla/configurations/type/${reportType}` : null,
    reportType ? () => api.sla.getByType(reportType) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

// ============================================================================
// SLA MUTATION HOOKS
// ============================================================================

/**
 * Hook for SLA configuration mutations (create, update, delete)
 */
export function useSLAMutations() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createConfiguration = useCallback(async (data: CreateSLAConfigurationData): Promise<SLAConfiguration> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.sla.create(data)
      setIsLoading(false)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create SLA configuration')
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [])

  const updateConfiguration = useCallback(async (id: string, data: UpdateSLAConfigurationData): Promise<SLAConfiguration> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.sla.update(id, data)
      setIsLoading(false)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update SLA configuration')
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [])

  const deleteConfiguration = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await api.sla.delete(id)
      setIsLoading(false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete SLA configuration')
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    isLoading,
    error,
    reset,
  }
}

// ============================================================================
// SLA CALCULATION HOOKS
// ============================================================================

/**
 * Hook for calculating SLA deadline
 */
export function useSLACalculation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<SLACalculationResult | null>(null)

  const calculate = useCallback(async (input: CalculateSLAInput): Promise<SLACalculationResult> => {
    setIsLoading(true)
    setError(null)
    try {
      const calculationResult = await api.sla.calculate(input)
      setResult(calculationResult)
      setIsLoading(false)
      return calculationResult
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to calculate SLA')
      setError(error)
      setIsLoading(false)
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    calculate,
    result,
    isLoading,
    error,
    reset,
  }
}

// ============================================================================
// SLA STATUS UTILITIES
// ============================================================================

/**
 * Calculate SLA status from deadline
 */
export function calculateSLAStatus(deadline: Date | string | null | undefined): SLAStatus {
  if (!deadline) return 'not_set'

  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline
  const now = new Date()
  const diff = deadlineDate.getTime() - now.getTime()
  const hoursRemaining = diff / (1000 * 60 * 60)

  if (diff <= 0) return 'overdue'
  if (hoursRemaining <= 24) return 'at_risk'
  return 'on_time'
}

/**
 * Format time remaining until deadline
 */
export function formatTimeRemaining(deadline: Date | string | null | undefined): string {
  if (!deadline) return 'No deadline'

  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline
  const now = new Date()
  const diff = deadlineDate.getTime() - now.getTime()

  if (diff <= 0) {
    const overdueDiff = Math.abs(diff)
    const hours = Math.floor(overdueDiff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d overdue`
    }
    return `${hours}h overdue`
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24

  if (days > 0) {
    return `${days}d ${remainingHours}h left`
  }
  return `${hours}h left`
}

/**
 * Hook for monitoring SLA status with auto-refresh
 */
export function useSLAMonitor(
  deadline: Date | string | null | undefined,
  refreshInterval: number = 60000 // 1 minute by default
) {
  const status = useMemo(() => calculateSLAStatus(deadline), [deadline])
  const timeRemaining = useMemo(() => formatTimeRemaining(deadline), [deadline])

  // Get color classes based on status
  const colorClasses = useMemo(() => {
    switch (status) {
      case 'on_time':
        return {
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          dot: 'bg-green-500',
        }
      case 'at_risk':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          dot: 'bg-amber-500',
        }
      case 'overdue':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          dot: 'bg-red-500',
        }
      case 'completed':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          dot: 'bg-blue-500',
        }
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-500',
          border: 'border-gray-200',
          dot: 'bg-gray-400',
        }
    }
  }, [status])

  const isUrgent = status === 'at_risk' || status === 'overdue'
  const isOverdue = status === 'overdue'

  return {
    status,
    timeRemaining,
    colorClasses,
    isUrgent,
    isOverdue,
    deadline: deadline ? (typeof deadline === 'string' ? new Date(deadline) : deadline) : null,
  }
}

/**
 * Get SLA status label
 */
export function getSLAStatusLabel(status: SLAStatus): string {
  const labels: Record<SLAStatus, string> = {
    on_time: 'On Time',
    at_risk: 'At Risk',
    overdue: 'Overdue',
    completed: 'Completed',
    not_set: 'No SLA',
  }
  return labels[status] || 'Unknown'
}

/**
 * Get default SLA hours by report type
 */
export function getDefaultSLAHours(reportType: SLAReportType): number {
  const defaults: Record<SLAReportType, number> = {
    flash_report: 24,
    immediate_actions: 72,
    root_cause: 240,
    action_plan: 360,
    final_report: 720,
  }
  return defaults[reportType] || 24
}

/**
 * Get report type display name
 */
export function getReportTypeLabel(reportType: SLAReportType): string {
  const labels: Record<SLAReportType, string> = {
    flash_report: 'Flash Report',
    immediate_actions: 'Immediate Actions',
    root_cause: 'Root Cause Analysis',
    action_plan: 'Action Plan',
    final_report: 'Final Report',
  }
  return labels[reportType] || reportType
}
