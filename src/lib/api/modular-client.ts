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
  WorkflowService
} from './services';

class ModularApiClient {
  private baseURL = env.NEXT_PUBLIC_API_URL;

  auth: AuthService;
  companies: CompanyService;
  incident: IncidentService;
  analysis: AnalysisService;
  documents: DocumentService;
  workflows: WorkflowService;

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
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const api = new ModularApiClient();

// Export types for use in components
export type { ModularApiClient };