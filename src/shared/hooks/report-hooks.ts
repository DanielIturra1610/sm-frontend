/**
 * Stegmaier Management - Report Hooks
 * Custom hooks for report management API integration with SWR
 * Includes Flash Reports, Immediate Actions, Root Cause, Action Plan, Final Reports, and Zero Tolerance
 */

import useSWR, { type SWRConfiguration } from 'swr'
import useSWRMutation from 'swr/mutation'
import { api } from '@/lib/api/modular-client'
import type {
  FlashReport,
  CreateFlashReportData,
  ImmediateActionsReport,
  RootCauseReport,
  ActionPlanReport,
  FinalReport,
  ZeroToleranceReport,
  CreateZeroToleranceReportData,
  PrefillData,
  PrefillReportType,
} from '@/shared/types/api'

// ============================================================================
// FLASH REPORT HOOKS
// ============================================================================

/**
 * Get list of flash reports
 */
export function useFlashReports(config?: SWRConfiguration) {
  return useSWR<FlashReport[]>(
    '/flash-reports',
    () => api.flashReport.list(),
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get specific flash report by ID
 */
export function useFlashReport(id: string | null, config?: SWRConfiguration) {
  return useSWR<FlashReport>(
    id ? `/flash-reports/${id}` : null,
    id ? () => api.flashReport.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get flash report by incident ID
 */
export function useFlashReportByIncident(incidentId: string | null, config?: SWRConfiguration) {
  return useSWR<FlashReport>(
    incidentId ? `/flash-reports/incident/${incidentId}` : null,
    incidentId ? () => api.flashReport.getByIncidentId(incidentId) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Create flash report
 */
export function useCreateFlashReport() {
  const { mutate: mutateFlashReports } = useFlashReports()

  return useSWRMutation<FlashReport, Error, string, CreateFlashReportData>('/flash-reports',
    async (key, { arg }) => {
      const newReport = await api.flashReport.create(arg)
      await mutateFlashReports()
      return newReport
    }
  )
}

/**
 * Update flash report
 */
export function useUpdateFlashReport(id: string) {
  const { mutate: mutateReport } = useFlashReport(id)
  const { mutate: mutateReports } = useFlashReports()

  return useSWRMutation(`/flash-reports/${id}`,
    async (key, { arg }) => {
      const updatedReport = await api.flashReport.update(id, arg)
      await mutateReport(updatedReport, false)
      await mutateReports()
      return updatedReport
    }
  )
}

/**
 * Submit flash report for review
 */
export function useSubmitFlashReport(id: string) {
  const { mutate: mutateReport } = useFlashReport(id)
  const { mutate: mutateReports } = useFlashReports()

  return useSWRMutation(`/flash-reports/${id}/submit`,
    async () => {
      const submitted = await api.flashReport.submit(id)
      await mutateReport(submitted, false)
      await mutateReports()
      return submitted
    }
  )
}

/**
 * Approve flash report
 */
export function useApproveFlashReport(id: string) {
  const { mutate: mutateReport } = useFlashReport(id)
  const { mutate: mutateReports } = useFlashReports()

  return useSWRMutation(`/flash-reports/${id}/approve`,
    async () => {
      const approved = await api.flashReport.approve(id)
      await mutateReport(approved, false)
      await mutateReports()
      return approved
    }
  )
}

/**
 * Delete flash report
 */
export function useDeleteFlashReport() {
  const { mutate: mutateReports } = useFlashReports()

  return useSWRMutation('/flash-reports/delete',
    async (key, { arg: id }: { arg: string }) => {
      await api.flashReport.delete(id)
      await mutateReports()
    }
  )
}

// ============================================================================
// IMMEDIATE ACTIONS REPORT HOOKS
// ============================================================================

/**
 * Get list of immediate actions reports
 */
export function useImmediateActionsReports(config?: SWRConfiguration) {
  return useSWR<ImmediateActionsReport[]>(
    '/immediate-actions',
    () => api.immediateActions.list(),
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get specific immediate actions report by ID
 */
export function useImmediateActionsReport(id: string | null, config?: SWRConfiguration) {
  return useSWR<ImmediateActionsReport>(
    id ? `/immediate-actions/${id}` : null,
    id ? () => api.immediateActions.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get immediate actions report by incident ID
 */
export function useImmediateActionsReportByIncident(incidentId: string | null, config?: SWRConfiguration) {
  return useSWR<ImmediateActionsReport>(
    incidentId ? `/immediate-actions/incident/${incidentId}` : null,
    incidentId ? () => api.immediateActions.getByIncidentId(incidentId) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Create immediate actions report
 */
export function useCreateImmediateActionsReport() {
  const { mutate: mutateReports } = useImmediateActionsReports()

  return useSWRMutation('/immediate-actions',
    async (key, { arg }) => {
      const newReport = await api.immediateActions.create(arg)
      await mutateReports()
      return newReport
    }
  )
}

/**
 * Update immediate actions report
 */
export function useUpdateImmediateActionsReport(id: string) {
  const { mutate: mutateReport } = useImmediateActionsReport(id)
  const { mutate: mutateReports } = useImmediateActionsReports()

  return useSWRMutation(`/immediate-actions/${id}`,
    async (key, { arg }) => {
      const updatedReport = await api.immediateActions.update(id, arg)
      await mutateReport(updatedReport, false)
      await mutateReports()
      return updatedReport
    }
  )
}

/**
 * Update immediate action item
 */
export function useUpdateImmediateActionItem(reportId: string, itemId: string) {
  const { mutate: mutateReport } = useImmediateActionsReport(reportId)

  return useSWRMutation(`/immediate-actions/${reportId}/items/${itemId}`,
    async (key, { arg }) => {
      const updatedReport = await api.immediateActions.updateItem(reportId, itemId, arg)
      await mutateReport(updatedReport, false)
      return updatedReport
    }
  )
}

/**
 * Submit immediate actions report
 */
export function useSubmitImmediateActionsReport(id: string) {
  const { mutate: mutateReport } = useImmediateActionsReport(id)
  const { mutate: mutateReports } = useImmediateActionsReports()

  return useSWRMutation(`/immediate-actions/${id}/submit`,
    async () => {
      const submitted = await api.immediateActions.submit(id)
      await mutateReport(submitted, false)
      await mutateReports()
      return submitted
    }
  )
}

/**
 * Approve immediate actions report
 */
export function useApproveImmediateActionsReport(id: string) {
  const { mutate: mutateReport } = useImmediateActionsReport(id)
  const { mutate: mutateReports } = useImmediateActionsReports()

  return useSWRMutation(`/immediate-actions/${id}/approve`,
    async () => {
      const approved = await api.immediateActions.approve(id)
      await mutateReport(approved, false)
      await mutateReports()
      return approved
    }
  )
}

/**
 * Delete immediate actions report
 */
export function useDeleteImmediateActionsReport() {
  const { mutate: mutateReports } = useImmediateActionsReports()

  return useSWRMutation('/immediate-actions/delete',
    async (key, { arg: id }: { arg: string }) => {
      await api.immediateActions.delete(id)
      await mutateReports()
    }
  )
}

// ============================================================================
// ROOT CAUSE ANALYSIS HOOKS
// ============================================================================

/**
 * Get list of root cause reports
 */
export function useRootCauseReports(config?: SWRConfiguration) {
  return useSWR<RootCauseReport[]>(
    '/root-cause',
    () => api.rootCause.list(),
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get specific root cause report by ID
 */
export function useRootCauseReport(id: string | null, config?: SWRConfiguration) {
  return useSWR<RootCauseReport>(
    id ? `/root-cause/${id}` : null,
    id ? () => api.rootCause.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get root cause report by incident ID
 */
export function useRootCauseReportByIncident(incidentId: string | null, config?: SWRConfiguration) {
  return useSWR<RootCauseReport>(
    incidentId ? `/root-cause/incident/${incidentId}` : null,
    incidentId ? () => api.rootCause.getByIncidentId(incidentId) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Create root cause report
 */
export function useCreateRootCauseReport() {
  const { mutate: mutateReports } = useRootCauseReports()

  return useSWRMutation('/root-cause',
    async (key, { arg }) => {
      const newReport = await api.rootCause.create(arg)
      await mutateReports()
      return newReport
    }
  )
}

/**
 * Update root cause report
 */
export function useUpdateRootCauseReport(id: string) {
  const { mutate: mutateReport } = useRootCauseReport(id)
  const { mutate: mutateReports } = useRootCauseReports()

  return useSWRMutation(`/root-cause/${id}`,
    async (key, { arg }) => {
      const updatedReport = await api.rootCause.update(id, arg)
      await mutateReport(updatedReport, false)
      await mutateReports()
      return updatedReport
    }
  )
}

/**
 * Update root cause analysis table
 */
export function useUpdateRootCauseTable(reportId: string, tableId: string) {
  const { mutate: mutateReport } = useRootCauseReport(reportId)

  return useSWRMutation(`/root-cause/${reportId}/tables/${tableId}`,
    async (key, { arg }) => {
      const updatedReport = await api.rootCause.updateTable(reportId, tableId, arg)
      await mutateReport(updatedReport, false)
      return updatedReport
    }
  )
}

/**
 * Submit root cause report
 */
export function useSubmitRootCauseReport(id: string) {
  const { mutate: mutateReport } = useRootCauseReport(id)
  const { mutate: mutateReports } = useRootCauseReports()

  return useSWRMutation(`/root-cause/${id}/submit`,
    async () => {
      const submitted = await api.rootCause.submit(id)
      await mutateReport(submitted, false)
      await mutateReports()
      return submitted
    }
  )
}

/**
 * Approve root cause report
 */
export function useApproveRootCauseReport(id: string) {
  const { mutate: mutateReport } = useRootCauseReport(id)
  const { mutate: mutateReports } = useRootCauseReports()

  return useSWRMutation(`/root-cause/${id}/approve`,
    async () => {
      const approved = await api.rootCause.approve(id)
      await mutateReport(approved, false)
      await mutateReports()
      return approved
    }
  )
}

/**
 * Delete root cause report
 */
export function useDeleteRootCauseReport() {
  const { mutate: mutateReports } = useRootCauseReports()

  return useSWRMutation('/root-cause/delete',
    async (key, { arg: id }: { arg: string }) => {
      await api.rootCause.delete(id)
      await mutateReports()
    },
    { throwOnError: true }
  )
}

// ============================================================================
// ACTION PLAN HOOKS
// ============================================================================

/**
 * Get list of action plan reports
 */
export function useActionPlanReports(config?: SWRConfiguration) {
  return useSWR<ActionPlanReport[]>(
    '/action-plan',
    () => api.actionPlan.list(),
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get specific action plan report by ID
 */
export function useActionPlanReport(id: string | null, config?: SWRConfiguration) {
  return useSWR<ActionPlanReport>(
    id ? `/action-plan/${id}` : null,
    id ? () => api.actionPlan.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get action plan report by incident ID
 */
export function useActionPlanReportByIncident(incidentId: string | null, config?: SWRConfiguration) {
  return useSWR<ActionPlanReport>(
    incidentId ? `/action-plan/incident/${incidentId}` : null,
    incidentId ? () => api.actionPlan.getByIncidentId(incidentId) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Create action plan report
 */
export function useCreateActionPlanReport() {
  const { mutate: mutateReports } = useActionPlanReports()

  return useSWRMutation('/action-plan',
    async (key, { arg }) => {
      const newReport = await api.actionPlan.create(arg)
      await mutateReports()
      return newReport
    }
  )
}

/**
 * Update action plan report
 */
export function useUpdateActionPlanReport(id: string) {
  const { mutate: mutateReport } = useActionPlanReport(id)
  const { mutate: mutateReports } = useActionPlanReports()

  return useSWRMutation(`/action-plan/${id}`,
    async (key, { arg }) => {
      const updatedReport = await api.actionPlan.update(id, arg)
      await mutateReport(updatedReport, false)
      await mutateReports()
      return updatedReport
    }
  )
}

/**
 * Update action plan item
 */
export function useUpdateActionPlanItem(reportId: string, itemId: string) {
  const { mutate: mutateReport } = useActionPlanReport(reportId)

  return useSWRMutation(`/action-plan/${reportId}/items/${itemId}`,
    async (key, { arg }) => {
      const updatedReport = await api.actionPlan.updateItem(reportId, itemId, arg)
      await mutateReport(updatedReport, false)
      return updatedReport
    }
  )
}

/**
 * Submit action plan report
 */
export function useSubmitActionPlanReport(id: string) {
  const { mutate: mutateReport } = useActionPlanReport(id)
  const { mutate: mutateReports } = useActionPlanReports()

  return useSWRMutation(`/action-plan/${id}/submit`,
    async () => {
      const submitted = await api.actionPlan.submit(id)
      await mutateReport(submitted, false)
      await mutateReports()
      return submitted
    }
  )
}

/**
 * Complete action plan report
 */
export function useCompleteActionPlanReport(id: string) {
  const { mutate: mutateReport } = useActionPlanReport(id)
  const { mutate: mutateReports } = useActionPlanReports()

  return useSWRMutation(`/action-plan/${id}/complete`,
    async () => {
      const completed = await api.actionPlan.complete(id)
      await mutateReport(completed, false)
      await mutateReports()
      return completed
    }
  )
}

/**
 * Approve action plan report
 */
export function useApproveActionPlanReport(id: string) {
  const { mutate: mutateReport } = useActionPlanReport(id)
  const { mutate: mutateReports } = useActionPlanReports()

  return useSWRMutation(`/action-plan/${id}/approve`,
    async () => {
      const approved = await api.actionPlan.approve(id)
      await mutateReport(approved, false)
      await mutateReports()
      return approved
    }
  )
}

/**
 * Delete action plan report
 */
export function useDeleteActionPlanReport() {
  const { mutate: mutateReports } = useActionPlanReports()

  return useSWRMutation('/action-plan/delete',
    async (key, { arg: id }: { arg: string }) => {
      await api.actionPlan.delete(id)
      await mutateReports()
    }
  )
}

// ============================================================================
// FINAL REPORT HOOKS
// ============================================================================

/**
 * Get list of final reports
 */
export function useFinalReports(config?: SWRConfiguration) {
  return useSWR<FinalReport[]>(
    '/final-reports',
    () => api.finalReport.list(),
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get specific final report by ID
 */
export function useFinalReport(id: string | null, config?: SWRConfiguration) {
  return useSWR<FinalReport>(
    id ? `/final-reports/${id}` : null,
    id ? () => api.finalReport.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get final report by incident ID
 */
export function useFinalReportByIncident(incidentId: string | null, config?: SWRConfiguration) {
  return useSWR<FinalReport>(
    incidentId ? `/final-reports/incident/${incidentId}` : null,
    incidentId ? () => api.finalReport.getByIncidentId(incidentId) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Create final report
 */
export function useCreateFinalReport() {
  const { mutate: mutateReports } = useFinalReports()

  return useSWRMutation('/final-reports',
    async (key, { arg }) => {
      const newReport = await api.finalReport.create(arg)
      await mutateReports()
      return newReport
    }
  )
}

/**
 * Update final report
 */
export function useUpdateFinalReport(id: string) {
  const { mutate: mutateReport } = useFinalReport(id)
  const { mutate: mutateReports } = useFinalReports()

  return useSWRMutation(`/final-reports/${id}`,
    async (key, { arg }) => {
      const updatedReport = await api.finalReport.update(id, arg)
      await mutateReport(updatedReport, false)
      await mutateReports()
      return updatedReport
    }
  )
}

/**
 * Submit final report
 */
export function useSubmitFinalReport(id: string) {
  const { mutate: mutateReport } = useFinalReport(id)
  const { mutate: mutateReports } = useFinalReports()

  return useSWRMutation(`/final-reports/${id}/submit`,
    async () => {
      const submitted = await api.finalReport.submit(id)
      await mutateReport(submitted, false)
      await mutateReports()
      return submitted
    }
  )
}

/**
 * Publish final report
 */
export function usePublishFinalReport(id: string) {
  const { mutate: mutateReport } = useFinalReport(id)
  const { mutate: mutateReports } = useFinalReports()

  return useSWRMutation(`/final-reports/${id}/publish`,
    async () => {
      const published = await api.finalReport.publish(id)
      await mutateReport(published, false)
      await mutateReports()
      return published
    }
  )
}

/**
 * Approve final report
 */
export function useApproveFinalReport(id: string) {
  const { mutate: mutateReport } = useFinalReport(id)
  const { mutate: mutateReports } = useFinalReports()

  return useSWRMutation(`/final-reports/${id}/approve`,
    async () => {
      const approved = await api.finalReport.approve(id)
      await mutateReport(approved, false)
      await mutateReports()
      return approved
    }
  )
}

/**
 * Delete final report
 */
export function useDeleteFinalReport() {
  const { mutate: mutateReports } = useFinalReports()

  return useSWRMutation('/final-reports/delete',
    async (key, { arg: id }: { arg: string }) => {
      await api.finalReport.delete(id)
      await mutateReports()
    }
  )
}

/**
 * Validate if a final report can be generated for an incident
 * Returns validation status and any errors that would prevent generation
 *
 * @param incidentId - The incident ID to validate generation for
 * @param config - Optional SWR configuration
 *
 * @example
 * const { data, isLoading } = useValidateFinalReportGeneration(incidentId)
 * if (data?.can_generate) {
 *   // Show generate button
 * } else {
 *   // Show errors: data?.errors
 * }
 */
export function useValidateFinalReportGeneration(
  incidentId: string | null,
  config?: SWRConfiguration
) {
  return useSWR<{ can_generate: boolean; errors: string[] }>(
    incidentId ? `/final-reports/incident/${incidentId}/validate-generate` : null,
    incidentId ? () => api.finalReport.validateGenerate(incidentId) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Auto-generate a final report from all previous reports
 * Consolidates data from Flash Report, Immediate Actions, Root Cause, and Action Plan
 *
 * @example
 * const { trigger: generateReport, isMutating } = useGenerateFinalReport(incidentId)
 *
 * const handleGenerate = async () => {
 *   try {
 *     const report = await generateReport()
 *     // Navigate to the generated report
 *     router.push(`/reports/final/${report.id}`)
 *   } catch (error) {
 *     // Handle error
 *   }
 * }
 */
export function useGenerateFinalReport(incidentId: string) {
  const { mutate: mutateReports } = useFinalReports()
  const { mutate: mutateFinalByIncident } = useFinalReportByIncident(incidentId)
  const { mutate: mutateValidation } = useValidateFinalReportGeneration(incidentId)

  return useSWRMutation(`/final-reports/incident/${incidentId}/generate`,
    async () => {
      const generatedReport = await api.finalReport.generate(incidentId)
      // Revalidate all related caches
      await mutateReports()
      await mutateFinalByIncident(generatedReport, false)
      await mutateValidation() // Revalidate validation (should now fail since report exists)
      return generatedReport
    }
  )
}

// ============================================================================
// ZERO TOLERANCE REPORT HOOKS
// ============================================================================

/**
 * Get list of zero tolerance reports
 */
export function useZeroToleranceReports(config?: SWRConfiguration) {
  return useSWR<ZeroToleranceReport[]>(
    '/zero-tolerance',
    () => api.zeroTolerance.list(),
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Get specific zero tolerance report by ID
 */
export function useZeroToleranceReport(id: string | null, config?: SWRConfiguration) {
  return useSWR<ZeroToleranceReport>(
    id ? `/zero-tolerance/${id}` : null,
    id ? () => api.zeroTolerance.getById(id) : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}

/**
 * Create zero tolerance report
 */
export function useCreateZeroToleranceReport() {
  const { mutate: mutateReports } = useZeroToleranceReports()

  return useSWRMutation<ZeroToleranceReport, Error, string, CreateZeroToleranceReportData>('/zero-tolerance',
    async (key, { arg }) => {
      const newReport = await api.zeroTolerance.create(arg)
      await mutateReports()
      return newReport
    }
  )
}

/**
 * Update zero tolerance report
 */
export function useUpdateZeroToleranceReport(id: string) {
  const { mutate: mutateReport } = useZeroToleranceReport(id)
  const { mutate: mutateReports } = useZeroToleranceReports()

  return useSWRMutation(`/zero-tolerance/${id}`,
    async (key, { arg }) => {
      const updatedReport = await api.zeroTolerance.update(id, arg)
      await mutateReport(updatedReport, false)
      await mutateReports()
      return updatedReport
    }
  )
}

/**
 * Submit zero tolerance report
 */
export function useSubmitZeroToleranceReport(id: string) {
  const { mutate: mutateReport } = useZeroToleranceReport(id)
  const { mutate: mutateReports } = useZeroToleranceReports()

  return useSWRMutation(`/zero-tolerance/${id}/submit`,
    async () => {
      const submitted = await api.zeroTolerance.submit(id)
      await mutateReport(submitted, false)
      await mutateReports()
      return submitted
    }
  )
}

/**
 * Close zero tolerance report
 */
export function useCloseZeroToleranceReport(id: string) {
  const { mutate: mutateReport } = useZeroToleranceReport(id)
  const { mutate: mutateReports } = useZeroToleranceReports()

  return useSWRMutation(`/zero-tolerance/${id}/close`,
    async () => {
      const closed = await api.zeroTolerance.close(id)
      await mutateReport(closed, false)
      await mutateReports()
      return closed
    }
  )
}

/**
 * Approve zero tolerance report
 */
export function useApproveZeroToleranceReport(id: string) {
  const { mutate: mutateReport } = useZeroToleranceReport(id)
  const { mutate: mutateReports } = useZeroToleranceReports()

  return useSWRMutation(`/zero-tolerance/${id}/approve`,
    async () => {
      const approved = await api.zeroTolerance.approve(id)
      await mutateReport(approved, false)
      await mutateReports()
      return approved
    }
  )
}

/**
 * Delete zero tolerance report
 */
export function useDeleteZeroToleranceReport() {
  const { mutate: mutateReports } = useZeroToleranceReports()

  return useSWRMutation('/zero-tolerance/delete',
    async (key, { arg: id }: { arg: string }) => {
      await api.zeroTolerance.delete(id)
      await mutateReports()
    }
  )
}

// ============================================================================
// PREFILL DATA HOOKS (Data persistence between reports)
// ============================================================================

/**
 * Get prefill data from previous reports for an incident
 * Used to pre-populate forms when creating new reports
 *
 * @param incidentId - The incident ID to get prefill data for
 * @param reportType - The target report type to get prefill data for
 * @param config - Optional SWR configuration
 *
 * @example
 * // Get prefill data when creating an immediate actions report
 * const { data: prefillData, isLoading } = usePrefillData(incidentId, 'immediate-actions')
 *
 * // Use prefillData to pre-populate form fields
 * useEffect(() => {
 *   if (prefillData) {
 *     form.reset({
 *       suceso: prefillData.suceso,
 *       lugar: prefillData.lugar,
 *       // ... other fields
 *     })
 *   }
 * }, [prefillData])
 */
export function usePrefillData(
  incidentId: string | null,
  reportType: PrefillReportType | null,
  config?: SWRConfiguration
) {
  return useSWR<PrefillData>(
    incidentId && reportType ? `/incidents/${incidentId}/prefill?type=${reportType}` : null,
    incidentId && reportType
      ? () => api.incident.getPrefillData(incidentId, reportType)
      : null,
    {
      revalidateOnFocus: false,
      ...config,
    }
  )
}
