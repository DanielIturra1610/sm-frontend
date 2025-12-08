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

export class IncidentService extends BaseService {
  /**
   * List incidents with optional filtering
   */
  async list(params?: IncidentListParams): Promise<IncidentListResponse> {
    const queryString = this.toQueryString(params as Record<string, unknown>);
    return this.request<IncidentListResponse>(`/incidents${queryString}`);
  }

  /**
   * Create new incident
   */
  async create(data: CreateIncidentData): Promise<Incident> {
    return this.request<Incident>('/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get incident by ID
   */
  async getById(id: string): Promise<Incident> {
    return this.request<Incident>(`/incidents/${id}`);
  }

  /**
   * Update incident
   */
  async update(id: string, data: UpdateIncidentData): Promise<Incident> {
    return this.request<Incident>(`/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
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
    return this.request<Incident>(`/incidents/${id}/submit`, {
      method: 'POST',
    });
  }

  /**
   * Start investigation on incident
   */
  async investigate(id: string): Promise<Incident> {
    return this.request<Incident>(`/incidents/${id}/investigate`, {
      method: 'POST',
    });
  }

  /**
   * Complete investigation on incident
   */
  async complete(id: string): Promise<Incident> {
    return this.request<Incident>(`/incidents/${id}/complete`, {
      method: 'POST',
    });
  }

  /**
   * Get incident statistics
   */
  async getStats(): Promise<IncidentStats> {
    return this.request<IncidentStats>('/incidents/stats');
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