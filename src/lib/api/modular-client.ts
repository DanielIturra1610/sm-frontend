/**
 * Stegmaier Management - Modular API Client
 * Uses separate services for each domain
 */

import { env, apiConfig } from '@/lib/env';
import {
  AuthService,
  CompanyService,
  IncidentService,
  AnalysisService,
  DocumentService,
  WorkflowService,
  FlashReportService,
  ImmediateActionsService,
  RootCauseService,
  ActionPlanService,
  FinalReportService,
  ZeroToleranceService,
  AttachmentService,
  MetricsService,
} from './services';

class ModularApiClient {
  private baseURL = env.NEXT_PUBLIC_API_URL;

  auth: AuthService;
  companies: CompanyService;
  incident: IncidentService;
  analysis: AnalysisService;
  documents: DocumentService;
  workflows: WorkflowService;
  flashReport: FlashReportService;
  immediateActions: ImmediateActionsService;
  rootCause: RootCauseService;
  actionPlan: ActionPlanService;
  finalReport: FinalReportService;
  zeroTolerance: ZeroToleranceService;
  attachments: AttachmentService;
  metrics: MetricsService;

  constructor() {
    const serviceConfig = {
      baseURL: this.baseURL,
      timeout: apiConfig.timeout,
    };

    this.auth = new AuthService(serviceConfig);
    this.companies = new CompanyService(serviceConfig);
    this.incident = new IncidentService(serviceConfig);
    this.analysis = new AnalysisService(serviceConfig);
    this.documents = new DocumentService(serviceConfig);
    this.workflows = new WorkflowService(serviceConfig);
    this.flashReport = new FlashReportService(serviceConfig);
    this.immediateActions = new ImmediateActionsService(serviceConfig);
    this.rootCause = new RootCauseService(serviceConfig);
    this.actionPlan = new ActionPlanService(serviceConfig);
    this.finalReport = new FinalReportService(serviceConfig);
    this.zeroTolerance = new ZeroToleranceService(serviceConfig);
    this.attachments = new AttachmentService(serviceConfig);
    this.metrics = new MetricsService(serviceConfig);
  }

  /**
   * Get token from auth service
   */
  async getToken(): Promise<string | null> {
    return this.auth.getToken();
  }

  /**
   * Remove token from auth service
   */
  async removeToken(): Promise<void> {
    return this.auth.removeToken();
  }

  /**
   * Update token in auth service
   */
  async updateToken(token: string): Promise<void> {
    return this.auth.updateToken(token);
  }

  /**
   * Set token in auth service (alias for updateToken)
   */
  async setToken(token: string): Promise<void> {
    return this.auth.updateToken(token);
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const api = new ModularApiClient();

// Export types for use in components
export type { ModularApiClient };