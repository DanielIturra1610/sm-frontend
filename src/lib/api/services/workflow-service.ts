/**
 * Workflow service for managing workflow processes
 */

import { BaseService } from './base-service';
import type {
  Workflow,
  WorkflowInstance,
  WorkflowTask,
  WorkflowTaskAssignment,
} from '@/shared/types/api';

export class WorkflowService extends BaseService {
  /**
   * Create workflow
   */
  async create(data: Workflow): Promise<Workflow> {
    return this.request<Workflow>('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Start workflow instance
   */
  async startInstance(id: string, instanceData: any): Promise<WorkflowInstance> {
    return this.request<WorkflowInstance>(`/workflows/${id}/start`, {
      method: 'POST',
      body: JSON.stringify(instanceData),
    });
  }

  /**
   * List workflow instances
   */
  async listInstances(): Promise<WorkflowInstance[]> {
    return this.request<WorkflowInstance[]>('/workflows/instances');
  }

  /**
   * Get user's assigned tasks
   */
  async getUserTasks(): Promise<WorkflowTask[]> {
    return this.request<WorkflowTask[]>('/workflows/tasks/my');
  }

  /**
   * Complete task
   */
  async completeTask(id: string, completionData?: any): Promise<WorkflowTask> {
    return this.request<WorkflowTask>(`/workflows/tasks/${id}/complete`, {
      method: 'POST',
      body: completionData ? JSON.stringify(completionData) : undefined,
    });
  }

  /**
   * Reassign task
   */
  async reassignTask(id: string, assignment: WorkflowTaskAssignment): Promise<WorkflowTask> {
    return this.request<WorkflowTask>(`/workflows/tasks/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  }
}