/**
 * Report services for managing incident reports
 * Includes Flash Reports, Immediate Actions, Root Cause Analysis, Action Plans, Final Reports, and Zero Tolerance
 */

import { BaseService } from './base-service';
import type {
  FlashReport,
  CreateFlashReportData,
  UpdateFlashReportData,
  ImmediateActionsReport,
  CreateImmediateActionsReportData,
  UpdateImmediateActionsReportData,
  UpdateImmediateActionItemData,
  RootCauseReport,
  CreateRootCauseReportData,
  UpdateRootCauseReportData,
  UpdateRootCauseAnalysisTableData,
  WhyQuestion,
  ActionPlanReport,
  CreateActionPlanReportData,
  UpdateActionPlanReportData,
  UpdateActionPlanItemData,
  FinalReport,
  CreateFinalReportData,
  UpdateFinalReportData,
  ZeroToleranceReport,
  CreateZeroToleranceReportData,
  UpdateZeroToleranceReportData,
} from '@/shared/types/api';

// ============================================================================
// FLASH REPORT SERVICE
// ============================================================================

export class FlashReportService extends BaseService {
  /**
   * Create a new flash report (must be created within 24 hours of incident)
   */
  async create(data: CreateFlashReportData): Promise<FlashReport> {
    return this.request<FlashReport>('/flash-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get flash report by ID
   */
  async getById(id: string): Promise<FlashReport> {
    return this.request<FlashReport>(`/flash-reports/${id}`);
  }

  /**
   * Get flash report by incident ID
   */
  async getByIncidentId(incidentId: string): Promise<FlashReport> {
    return this.request<FlashReport>(`/flash-reports/incident/${incidentId}`);
  }

  /**
   * List all flash reports
   */
  async list(): Promise<FlashReport[]> {
    const response = await this.request<{ reports: FlashReport[], total: number, limit: number, offset: number }>('/flash-reports');
    return response.reports || [];
  }

  /**
   * Update flash report
   */
  async update(id: string, data: UpdateFlashReportData): Promise<FlashReport> {
    return this.request<FlashReport>(`/flash-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete flash report
   */
  async delete(id: string): Promise<void> {
    return this.request<void>(`/flash-reports/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Submit flash report for review
   */
  async submit(id: string): Promise<FlashReport> {
    return this.request<FlashReport>(`/flash-reports/${id}/submit`, {
      method: 'POST',
    });
  }

  /**
   * Approve flash report
   */
  async approve(id: string): Promise<FlashReport> {
    return this.request<FlashReport>(`/flash-reports/${id}/approve`, {
      method: 'POST',
    });
  }

  /**
   * Reject flash report
   */
  async reject(id: string): Promise<FlashReport> {
    return this.request<FlashReport>(`/flash-reports/${id}/reject`, {
      method: 'POST',
    });
  }

  /**
   * Export flash report to PDF, DOCX or PPTX format
   * Downloads the file with the specified filename
   * Routes: /exports/flash-reports/:id/pdf, /exports/flash-reports/:id/docx, /exports/flash-reports/:id/pptx
   */
  async export(id: string, format: 'pdf' | 'docx' | 'pptx', filename: string): Promise<void> {
    return this.downloadRequest(
      `/exports/flash-reports/${id}/${format}`,
      filename
    );
  }
}

// ============================================================================
// IMMEDIATE ACTIONS REPORT SERVICE
// ============================================================================

export class ImmediateActionsService extends BaseService {
  /**
   * Create a new immediate actions report (24-48h timeframe)
   */
  async create(data: CreateImmediateActionsReportData): Promise<ImmediateActionsReport> {
    return this.request<ImmediateActionsReport>('/immediate-actions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get immediate actions report by ID
   */
  async getById(id: string): Promise<ImmediateActionsReport> {
    return this.request<ImmediateActionsReport>(`/immediate-actions/${id}`);
  }

  /**
   * Get immediate actions report by incident ID
   */
  async getByIncidentId(incidentId: string): Promise<ImmediateActionsReport> {
    return this.request<ImmediateActionsReport>(`/immediate-actions/incident/${incidentId}`);
  }

  /**
   * List all immediate actions reports
   */
  async list(): Promise<ImmediateActionsReport[]> {
    const response = await this.request<{ reports: ImmediateActionsReport[], total: number, limit: number, offset: number }>('/immediate-actions');
    return response.reports || [];
  }

  /**
   * Update immediate actions report
   */
  async update(id: string, data: UpdateImmediateActionsReportData): Promise<ImmediateActionsReport> {
    return this.request<ImmediateActionsReport>(`/immediate-actions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a specific action item
   */
  async updateItem(reportId: string, itemId: string, data: UpdateImmediateActionItemData): Promise<ImmediateActionsReport> {
    return this.request<ImmediateActionsReport>(`/immediate-actions/${reportId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete immediate actions report
   */
  async delete(id: string): Promise<void> {
    return this.request<void>(`/immediate-actions/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Submit report for review
   */
  async submit(id: string): Promise<ImmediateActionsReport> {
    return this.request<ImmediateActionsReport>(`/immediate-actions/${id}/submit`, {
      method: 'POST',
    });
  }

  /**
   * Approve report
   */
  async approve(id: string): Promise<ImmediateActionsReport> {
    return this.request<ImmediateActionsReport>(`/immediate-actions/${id}/approve`, {
      method: 'POST',
    });
  }

  /**
   * Reject report
   */
  async reject(id: string): Promise<ImmediateActionsReport> {
    return this.request<ImmediateActionsReport>(`/immediate-actions/${id}/reject`, {
      method: 'POST',
    });
  }

  /**
   * Export report to PDF or DOCX format
   * Downloads the file with the specified filename
   * Routes: /exports/immediate-actions/:id/pdf, /exports/immediate-actions/:id/docx
   */
  async export(id: string, format: 'pdf' | 'docx', filename: string): Promise<void> {
    return this.downloadRequest(
      `/exports/immediate-actions/${id}/${format}`,
      filename
    );
  }
}

// ============================================================================
// ROOT CAUSE ANALYSIS SERVICE
// ============================================================================

export class RootCauseService extends BaseService {
  /**
   * Create a new root cause analysis report (2-7 days timeframe)
   */
  async create(data: CreateRootCauseReportData): Promise<RootCauseReport> {
    return this.request<RootCauseReport>('/root-cause', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get root cause report by ID
   */
  async getById(id: string): Promise<RootCauseReport> {
    return this.request<RootCauseReport>(`/root-cause/${id}`);
  }

  /**
   * Get root cause report by incident ID
   */
  async getByIncidentId(incidentId: string): Promise<RootCauseReport> {
    return this.request<RootCauseReport>(`/root-cause/incident/${incidentId}`);
  }

  /**
   * List all root cause reports
   */
  async list(): Promise<RootCauseReport[]> {
    const response = await this.request<{ reports: RootCauseReport[], total: number, limit: number, offset: number }>('/root-cause');
    return response.reports || [];
  }

  /**
   * Update root cause report
   */
  async update(id: string, data: UpdateRootCauseReportData): Promise<RootCauseReport> {
    return this.request<RootCauseReport>(`/root-cause/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a specific analysis table
   */
  async updateTable(reportId: string, tableId: string, data: UpdateRootCauseAnalysisTableData): Promise<RootCauseReport> {
    return this.request<RootCauseReport>(`/root-cause/${reportId}/tables/${tableId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Add a "why" question to an analysis table
   */
  async addWhyQuestion(reportId: string, tableId: string, data: WhyQuestion): Promise<RootCauseReport> {
    return this.request<RootCauseReport>(`/root-cause/${reportId}/tables/${tableId}/whys`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete root cause report
   */
  async delete(id: string): Promise<void> {
    return this.request<void>(`/root-cause/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Submit report for review
   */
  async submit(id: string): Promise<RootCauseReport> {
    return this.request<RootCauseReport>(`/root-cause/${id}/submit`, {
      method: 'POST',
    });
  }

  /**
   * Approve report
   */
  async approve(id: string): Promise<RootCauseReport> {
    return this.request<RootCauseReport>(`/root-cause/${id}/approve`, {
      method: 'POST',
    });
  }

  /**
   * Reject report
   */
  async reject(id: string): Promise<RootCauseReport> {
    return this.request<RootCauseReport>(`/root-cause/${id}/reject`, {
      method: 'POST',
    });
  }

  /**
   * Export report to PDF, DOCX or XLSX format
   * Downloads the file with the specified filename
   * Routes: /exports/root-cause/:id/pdf, /exports/root-cause/:id/docx, /exports/root-cause/:id/xlsx
   */
  async export(id: string, format: 'pdf' | 'docx' | 'xlsx', filename: string): Promise<void> {
    return this.downloadRequest(
      `/exports/root-cause/${id}/${format}`,
      filename
    );
  }
}

// ============================================================================
// ACTION PLAN SERVICE
// ============================================================================

export class ActionPlanService extends BaseService {
  /**
   * Create a new action plan report (7-14 days timeframe)
   */
  async create(data: CreateActionPlanReportData): Promise<ActionPlanReport> {
    return this.request<ActionPlanReport>('/action-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get action plan report by ID
   */
  async getById(id: string): Promise<ActionPlanReport> {
    return this.request<ActionPlanReport>(`/action-plan/${id}`);
  }

  /**
   * Get action plan report by incident ID
   */
  async getByIncidentId(incidentId: string): Promise<ActionPlanReport> {
    return this.request<ActionPlanReport>(`/action-plan/incident/${incidentId}`);
  }

  /**
   * List all action plan reports
   */
  async list(): Promise<ActionPlanReport[]> {
    const response = await this.request<{ reports: ActionPlanReport[], total: number, limit: number, offset: number }>('/action-plan');
    return response.reports || [];
  }

  /**
   * Update action plan report
   */
  async update(id: string, data: UpdateActionPlanReportData): Promise<ActionPlanReport> {
    return this.request<ActionPlanReport>(`/action-plan/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a specific action plan item
   */
  async updateItem(reportId: string, itemId: string, data: UpdateActionPlanItemData): Promise<ActionPlanReport> {
    return this.request<ActionPlanReport>(`/action-plan/${reportId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete action plan report
   */
  async delete(id: string): Promise<void> {
    return this.request<void>(`/action-plan/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Submit report for review
   */
  async submit(id: string): Promise<ActionPlanReport> {
    return this.request<ActionPlanReport>(`/action-plan/${id}/submit`, {
      method: 'POST',
    });
  }

  /**
   * Approve report
   */
  async approve(id: string): Promise<ActionPlanReport> {
    return this.request<ActionPlanReport>(`/action-plan/${id}/approve`, {
      method: 'POST',
    });
  }

  /**
   * Reject report
   */
  async reject(id: string): Promise<ActionPlanReport> {
    return this.request<ActionPlanReport>(`/action-plan/${id}/reject`, {
      method: 'POST',
    });
  }

  /**
   * Mark action plan as completed
   */
  async complete(id: string): Promise<ActionPlanReport> {
    return this.request<ActionPlanReport>(`/action-plan/${id}/complete`, {
      method: 'POST',
    });
  }

  /**
   * Export report to PDF, DOCX or XLSX format
   * Downloads the file with the specified filename
   * Routes: /exports/action-plan/:id/pdf, /exports/action-plan/:id/docx, /exports/action-plan/:id/xlsx
   */
  async export(id: string, format: 'pdf' | 'docx' | 'xlsx', filename: string): Promise<void> {
    return this.downloadRequest(
      `/exports/action-plan/${id}/${format}`,
      filename
    );
  }
}

// ============================================================================
// FINAL REPORT SERVICE
// ============================================================================

export class FinalReportService extends BaseService {
  /**
   * Create a new final report (after all actions are completed)
   */
  async create(data: CreateFinalReportData): Promise<FinalReport> {
    return this.request<FinalReport>('/final-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get final report by ID
   */
  async getById(id: string): Promise<FinalReport> {
    return this.request<FinalReport>(`/final-reports/${id}`);
  }

  /**
   * Get final report by incident ID
   */
  async getByIncidentId(incidentId: string): Promise<FinalReport> {
    return this.request<FinalReport>(`/final-reports/incident/${incidentId}`);
  }

  /**
   * List all final reports
   */
  async list(): Promise<FinalReport[]> {
    const response = await this.request<{ reports: FinalReport[], total: number, limit: number, offset: number }>('/final-reports');
    return response.reports || [];
  }

  /**
   * Update final report
   */
  async update(id: string, data: UpdateFinalReportData): Promise<FinalReport> {
    return this.request<FinalReport>(`/final-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete final report
   */
  async delete(id: string): Promise<void> {
    return this.request<void>(`/final-reports/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Submit report for review
   */
  async submit(id: string): Promise<FinalReport> {
    return this.request<FinalReport>(`/final-reports/${id}/submit`, {
      method: 'POST',
    });
  }

  /**
   * Approve report
   */
  async approve(id: string): Promise<FinalReport> {
    return this.request<FinalReport>(`/final-reports/${id}/approve`, {
      method: 'POST',
    });
  }

  /**
   * Reject report
   */
  async reject(id: string): Promise<FinalReport> {
    return this.request<FinalReport>(`/final-reports/${id}/reject`, {
      method: 'POST',
    });
  }

  /**
   * Publish final report
   */
  async publish(id: string): Promise<FinalReport> {
    return this.request<FinalReport>(`/final-reports/${id}/publish`, {
      method: 'POST',
    });
  }

  /**
   * Validate if a final report can be generated for an incident
   * Returns validation result indicating whether generation is possible and any errors
   */
  async validateGenerate(incidentId: string): Promise<{ can_generate: boolean; errors: string[] }> {
    return this.request<{ can_generate: boolean; errors: string[] }>(
      `/final-reports/incident/${incidentId}/validate-generate`
    );
  }

  /**
   * Auto-generate a final report from all previous reports for an incident
   * Consolidates data from Flash Report, Immediate Actions, Root Cause, and Action Plan
   */
  async generate(incidentId: string): Promise<FinalReport> {
    return this.request<FinalReport>(`/final-reports/incident/${incidentId}/generate`, {
      method: 'POST',
    });
  }

  /**
   * Export report to PDF or DOCX format
   * Downloads the file with the specified filename
   * Routes: /exports/final-reports/:id/pdf, /exports/final-reports/:id/docx
   */
  async export(id: string, format: 'pdf' | 'docx', filename: string): Promise<void> {
    return this.downloadRequest(
      `/exports/final-reports/${id}/${format}`,
      filename
    );
  }
}

// ============================================================================
// ZERO TOLERANCE REPORT SERVICE
// ============================================================================

export class ZeroToleranceService extends BaseService {
  /**
   * Create a new zero tolerance report
   */
  async create(data: CreateZeroToleranceReportData): Promise<ZeroToleranceReport> {
    return this.request<ZeroToleranceReport>('/zero-tolerance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get zero tolerance report by ID
   */
  async getById(id: string): Promise<ZeroToleranceReport> {
    return this.request<ZeroToleranceReport>(`/zero-tolerance/${id}`);
  }

  /**
   * Get zero tolerance report by incident ID
   */
  async getByIncidentId(incidentId: string): Promise<ZeroToleranceReport> {
    return this.request<ZeroToleranceReport>(`/zero-tolerance/incident/${incidentId}`);
  }

  /**
   * List all zero tolerance reports
   */
  async list(): Promise<ZeroToleranceReport[]> {
    const response = await this.request<{ reports: ZeroToleranceReport[], total: number, limit: number, offset: number }>('/zero-tolerance');
    return response.reports || [];
  }

  /**
   * Update zero tolerance report
   */
  async update(id: string, data: UpdateZeroToleranceReportData): Promise<ZeroToleranceReport> {
    return this.request<ZeroToleranceReport>(`/zero-tolerance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete zero tolerance report
   */
  async delete(id: string): Promise<void> {
    return this.request<void>(`/zero-tolerance/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Submit report for review
   */
  async submit(id: string): Promise<ZeroToleranceReport> {
    return this.request<ZeroToleranceReport>(`/zero-tolerance/${id}/submit`, {
      method: 'POST',
    });
  }

  /**
   * Approve report
   */
  async approve(id: string): Promise<ZeroToleranceReport> {
    return this.request<ZeroToleranceReport>(`/zero-tolerance/${id}/approve`, {
      method: 'POST',
    });
  }

  /**
   * Reject report
   */
  async reject(id: string): Promise<ZeroToleranceReport> {
    return this.request<ZeroToleranceReport>(`/zero-tolerance/${id}/reject`, {
      method: 'POST',
    });
  }

  /**
   * Close zero tolerance report
   */
  async close(id: string): Promise<ZeroToleranceReport> {
    return this.request<ZeroToleranceReport>(`/zero-tolerance/${id}/close`, {
      method: 'POST',
    });
  }

  /**
   * Export report to PDF or DOCX format
   * Downloads the file with the specified filename
   * Routes: /exports/zero-tolerance/:id/pdf, /exports/zero-tolerance/:id/docx
   */
  async export(id: string, format: 'pdf' | 'docx', filename: string): Promise<void> {
    return this.downloadRequest(
      `/exports/zero-tolerance/${id}/${format}`,
      filename
    );
  }
}
