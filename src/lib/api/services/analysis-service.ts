/**
 * Analysis service for managing root cause analysis tools
 */

import { BaseService } from './base-service';
import type {
  FiveWhysAnalysis,
  CreateFiveWhysData,
  FishboneAnalysis,
  CreateFishboneData,
  FishboneCause,
  AnalysisTemplate,
  AnalysisReport,
} from '@/shared/types/api';

export class AnalysisService extends BaseService {
  /**
   * Create Five Whys analysis
   */
  async createFiveWhys(data: CreateFiveWhysData): Promise<FiveWhysAnalysis> {
    return this.request<FiveWhysAnalysis>('/analysis/five-whys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get Five Whys analysis by ID
   */
  async getFiveWhysById(id: string): Promise<FiveWhysAnalysis> {
    return this.request<FiveWhysAnalysis>(`/analysis/five-whys/${id}`);
  }

  /**
   * Update Five Whys analysis
   */
  async updateFiveWhys(id: string, data: Partial<CreateFiveWhysData>): Promise<FiveWhysAnalysis> {
    return this.request<FiveWhysAnalysis>(`/analysis/five-whys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Create Fishbone analysis
   */
  async createFishbone(data: CreateFishboneData): Promise<FishboneAnalysis> {
    return this.request<FishboneAnalysis>('/analysis/fishbone', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get Fishbone analysis by ID
   */
  async getFishboneById(id: string): Promise<FishboneAnalysis> {
    return this.request<FishboneAnalysis>(`/analysis/fishbone/${id}`);
  }

  /**
   * Update Fishbone analysis
   */
  async updateFishbone(id: string, data: Partial<CreateFishboneData>): Promise<FishboneAnalysis> {
    return this.request<FishboneAnalysis>(`/analysis/fishbone/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Add causes to Fishbone analysis
   */
  async addFishboneCauses(id: string, causes: FishboneCause[]): Promise<FishboneAnalysis> {
    return this.request<FishboneAnalysis>(`/analysis/fishbone/${id}/causes`, {
      method: 'POST',
      body: JSON.stringify(causes),
    });
  }

  /**
   * Create analysis template
   */
  async createTemplate(data: AnalysisTemplate): Promise<AnalysisTemplate> {
    return this.request<AnalysisTemplate>('/analysis/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Generate analysis report
   */
  async generateReport(id: string): Promise<AnalysisReport> {
    return this.request<AnalysisReport>(`/analysis/${id}/report`, {
      method: 'POST',
    });
  }
}