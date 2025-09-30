/**
 * Stegmaier Management - Workflow Hooks
 * Custom hooks for workflow management API integration with SWR
 */

import useSWR, { type SWRConfiguration } from 'swr'
import useSWRMutation from 'swr/mutation'
import { api } from '@/lib/api/modular-client'
import type {
  Workflow,
  WorkflowInstance,
  WorkflowTask,
  WorkflowTaskAssignment,
} from '@/shared/types/api'

// ============================================================================
// WORKFLOW HOOKS
// ============================================================================

/**
 * Create workflow
 */
export function useCreateWorkflow() {
  return useSWRMutation('/workflows',
    async (key, { arg }: { arg: Workflow }) =>
      api.workflows.create(arg)
  )
}

/**
 * Start workflow instance
 */
export function useStartWorkflowInstance(workflowId: string) {
  return {
    startInstance: async (instanceData: any) => {
      return api.workflows.startInstance(workflowId, instanceData)
    }
  }
}

/**
 * List workflow instances
 */
export function useWorkflowInstances(config?: SWRConfiguration) {
  return useSWR<WorkflowInstance[]>(
    '/workflows/instances',
    () => api.workflows.listInstances(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...config,
    }
  )
}

/**
 * Get user's assigned tasks
 */
export function useUserTasks(config?: SWRConfiguration) {
  return useSWR<WorkflowTask[]>(
    '/workflows/tasks/my',
    () => api.workflows.getUserTasks(),
    {
      revalidateOnFocus: true, // Tasks might change frequently
      revalidateOnReconnect: true,
      ...config,
    }
  )
}

/**
 * Complete task
 */
export function useCompleteTask(taskId: string) {
  const { mutate: mutateUserTasks } = useSWR<WorkflowTask[]>('/workflows/tasks/my')

  return {
    completeTask: async (completionData?: any) => {
      const response = await api.workflows.completeTask(taskId, completionData)
      
      // Refresh user's task list
      await mutateUserTasks()
      
      return response
    }
  }
}

/**
 * Reassign task
 */
export function useReassignTask(taskId: string) {
  const { mutate: mutateUserTasks } = useSWR<WorkflowTask[]>('/workflows/tasks/my')

  return {
    reassignTask: async (assignment: WorkflowTaskAssignment) => {
      const response = await api.workflows.reassignTask(taskId, assignment)
      
      // Refresh user's task list
      await mutateUserTasks()
      
      return response
    }
  }
}