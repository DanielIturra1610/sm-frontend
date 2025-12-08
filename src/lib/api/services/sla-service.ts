/**
 * SLA Service for managing SLA configurations and calculations
 */

import { BaseService } from './base-service';
import type {
  SLAConfiguration,
  CreateSLAConfigurationData,
  UpdateSLAConfigurationData,
  SLAReportType,
  CalculateSLAInput,
  SLACalculationResult,
} from '@/shared/types/api';

export class SLAService extends BaseService {
  /**
   * List all SLA configurations for the current tenant
   */
  async list(): Promise<SLAConfiguration[]> {
    return this.request<SLAConfiguration[]>('/sla/configurations');
  }

  /**
   * Get SLA configuration by ID
   */
  async getById(id: string): Promise<SLAConfiguration> {
    return this.request<SLAConfiguration>(`/sla/configurations/${id}`);
  }

  /**
   * Get SLA configuration by report type
   */
  async getByType(reportType: SLAReportType): Promise<SLAConfiguration> {
    return this.request<SLAConfiguration>(`/sla/configurations/type/${reportType}`);
  }

  /**
   * Create a new SLA configuration
   */
  async create(data: CreateSLAConfigurationData): Promise<SLAConfiguration> {
    return this.request<SLAConfiguration>('/sla/configurations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing SLA configuration
   */
  async update(id: string, data: UpdateSLAConfigurationData): Promise<SLAConfiguration> {
    return this.request<SLAConfiguration>(`/sla/configurations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete an SLA configuration
   */
  async delete(id: string): Promise<void> {
    return this.request<void>(`/sla/configurations/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Calculate SLA deadline based on input parameters
   */
  async calculate(input: CalculateSLAInput): Promise<SLACalculationResult> {
    return this.request<SLACalculationResult>('/sla/calculate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  /**
   * Get default SLA configuration for a report type (creates if doesn't exist)
   */
  async getOrCreateDefault(reportType: SLAReportType): Promise<SLAConfiguration> {
    return this.request<SLAConfiguration>(`/sla/configurations/default/${reportType}`, {
      method: 'POST',
    });
  }

  /**
   * Bulk update SLA configurations
   */
  async bulkUpdate(configurations: UpdateSLAConfigurationData[]): Promise<SLAConfiguration[]> {
    return this.request<SLAConfiguration[]>('/sla/configurations/bulk', {
      method: 'PUT',
      body: JSON.stringify({ configurations }),
    });
  }
}
