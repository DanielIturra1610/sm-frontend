/**
 * Incident service for managing incidents and related analytics
 */

import { BaseService } from './base-service';
import type {
  Incident,
  CreateIncidentData,
  UpdateIncidentData,
  IncidentListParams,
  IncidentListResponse,
  IncidentStats,
  IncidentTrends,
  IncidentExportRequest,
  PrefillData,
  PrefillReportType,
} from '@/shared/types/api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiIncident = Record<string, any>;

// Transform API response to frontend Incident type
function transformIncident(apiData: ApiIncident): Incident {
  return {
    id: apiData.id as string,
    title: apiData.title as string,
    description: (apiData.description as string) || '',
    severity: apiData.severity as Incident['severity'],
    status: apiData.status as Incident['status'],
    type: (apiData.type as Incident['type']) || 'incident',
    location: (apiData.location as string) || '',
    reportedBy: (apiData.reported_by_name as string) || (apiData.reported_by as string) || '',
    reportedAt: (apiData.date_time as string) || (apiData.created_at as string) || '',
    assignedTo: apiData.assigned_to as string | undefined,
    tags: (apiData.tags as string[]) || [],
    attachments: (apiData.attachments as Incident['attachments']) || [],
    companyId: (apiData.tenant_id as string) || '',
    workflowState: {
      currentStep: (apiData.workflow_state as string) || 'draft',
      availableActions: [],
      completedSteps: [],
      pendingApprovals: [],
    },
    createdAt: apiData.created_at as string,
    updatedAt: apiData.updated_at as string,
  };
}

export class IncidentService extends BaseService {
  /**
   * List incidents with optional filtering
   */
  async list(params?: IncidentListParams): Promise<IncidentListResponse> {
    const queryString = this.toQueryString(params as Record<string, unknown>);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await this.request<any>(`/incidents${queryString}`);
    
    // Transform backend response to frontend format
    const incidents = (response.incidents || []).map((inc: ApiIncident) => transformIncident(inc));
    const limit = params?.limit || response.limit || 10;
    const offset = response.offset || 0;
    const total = response.total || incidents.length;
    
    return {
      data: incidents,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create new incident
   */
  async create(data: CreateIncidentData): Promise<Incident> {
    const response = await this.request<ApiIncident>('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return transformIncident(response);
  }

  /**
   * Get incident by ID
   */
  async getById(id: string): Promise<Incident> {
    const response = await this.request<ApiIncident>(`/incidents/${id}`);
    return transformIncident(response);
  }

  /**
   * Update incident
   */
  async update(id: string, data: UpdateIncidentData): Promise<Incident> {
    const response = await this.request<ApiIncident>(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return transformIncident(response);
  }

  /**
   * Delete incident
   */
  async delete(id: string): Promise<void> {
    return this.request<void>(`/incidents/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Submit incident for review
   */
  async submit(id: string): Promise<Incident> {
    const response = await this.request<ApiIncident>(`/incidents/${id}/submit`, {
      method: 'POST',
    });
    return transformIncident(response);
  }

  /**
   * Start investigation on incident
   */
  async investigate(id: string): Promise<Incident> {
    const response = await this.request<ApiIncident>(`/incidents/${id}/investigate`, {
      method: 'POST',
    });
    return transformIncident(response);
  }

  /**
   * Complete investigation on incident
   */
  async complete(id: string): Promise<Incident> {
    const response = await this.request<ApiIncident>(`/incidents/${id}/complete`, {
      method: 'POST',
    });
    return transformIncident(response);
  }

  /**
   * Get incident statistics
   */
  async getStats(): Promise<IncidentStats> {
    return this.request<IncidentStats>('/incidents/statistics');
  }

  /**
   * Get incident trends
   */
  async getTrends(): Promise<IncidentTrends> {
    return this.request<IncidentTrends>('/incidents/trends');
  }

  /**
   * Export incidents
   */
  async export(request: IncidentExportRequest): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/incidents/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.getToken()}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Export failed');
    }

    return response.blob();
  }

  /**
   * Get prefill data from previous reports for an incident
   * Used to pre-populate forms when creating new reports
   */
  async getPrefillData(incidentId: string, reportType: PrefillReportType): Promise<PrefillData> {
    return this.request<PrefillData>(`/incidents/${incidentId}/prefill?type=${reportType}`);
  }
}
