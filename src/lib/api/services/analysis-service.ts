/**
 * Analysis service for managing root cause analysis tools
 */

import { BaseService } from './base-service';
import type {
  FiveWhysAnalysis,
  CreateFiveWhysData,
  WhyEntry,
  AddWhyEntryData,
  UpdateWhyEntryData,
  FiveWhysActionItem,
  AddActionItemData,
  UpdateActionItemData,
  FishboneAnalysis,
  CreateFishboneData,
  FishboneCause,
  AnalysisTemplate,
  AnalysisReport,
} from '@/shared/types/api';
import type {
  CausalTreeAnalysis,
  CausalTreeAnalysisListResponse,
  CausalTreeAnalysisFilter,
  CreateCausalTreeAnalysisDTO,
  UpdateCausalTreeAnalysisDTO,
  CausalNode,
  AddCausalNodeDTO,
  UpdateCausalNodeDTO,
  PreventiveMeasure,
  AddPreventiveMeasureDTO,
  UpdatePreventiveMeasureDTO,
  CausalTreeValidation,
  CausalTreeMetrics,
} from '@/shared/types/causal-tree';

export class AnalysisService extends BaseService {
  /**
   * List all Fishbone analyses
   */
  async listFishbone(params?: { status?: string; search?: string }): Promise<FishboneAnalysis[]> {
    const query = this.toQueryString(params);
    return this.request<FishboneAnalysis[]>(`/analysis/fishbone${query}`);
  }

  /**
   * List all Five Whys analyses
   */
  async listFiveWhys(params?: { status?: string; search?: string }): Promise<FiveWhysAnalysis[]> {
    const query = this.toQueryString(params);
    return this.request<FiveWhysAnalysis[]>(`/analysis/five-whys${query}`);
  }

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
   * Delete Five Whys analysis
   */
  async deleteFiveWhys(id: string): Promise<void> {
    return this.request<void>(`/analysis/five-whys/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Five Whys - Why Entries
  // ============================================================================

  /**
   * Add why entry to Five Whys analysis
   */
  async addWhyEntry(analysisId: string, data: AddWhyEntryData): Promise<WhyEntry> {
    return this.request<WhyEntry>(`/analysis/five-whys/${analysisId}/whys`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get why entries for Five Whys analysis
   */
  async getWhyEntries(analysisId: string): Promise<WhyEntry[]> {
    return this.request<WhyEntry[]>(`/analysis/five-whys/${analysisId}/whys`);
  }

  /**
   * Update why entry
   */
  async updateWhyEntry(analysisId: string, entryId: string, data: UpdateWhyEntryData): Promise<WhyEntry> {
    return this.request<WhyEntry>(`/analysis/five-whys/${analysisId}/whys/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete why entry
   */
  async deleteWhyEntry(analysisId: string, entryId: string): Promise<void> {
    return this.request<void>(`/analysis/five-whys/${analysisId}/whys/${entryId}`, {
      method: 'DELETE',
    });
  }

  // ============================================================================
  // Five Whys - Action Items
  // ============================================================================

  /**
   * Add action item to Five Whys analysis
   */
  async addFiveWhysActionItem(analysisId: string, data: AddActionItemData): Promise<FiveWhysActionItem> {
    return this.request<FiveWhysActionItem>(`/analysis/five-whys/${analysisId}/action-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get action items for Five Whys analysis
   */
  async getFiveWhysActionItems(analysisId: string): Promise<FiveWhysActionItem[]> {
    return this.request<FiveWhysActionItem[]>(`/analysis/five-whys/${analysisId}/action-items`);
  }

  /**
   * Update Five Whys action item
   */
  async updateFiveWhysActionItem(analysisId: string, itemId: string, data: UpdateActionItemData): Promise<FiveWhysActionItem> {
    return this.request<FiveWhysActionItem>(`/analysis/five-whys/${analysisId}/action-items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete Five Whys action item
   */
  async deleteFiveWhysActionItem(analysisId: string, itemId: string): Promise<void> {
    return this.request<void>(`/analysis/five-whys/${analysisId}/action-items/${itemId}`, {
      method: 'DELETE',
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

  // ============================================================================
  // Causal Tree (Árbol de Causas) Methods
  // ============================================================================

  /**
   * List all Causal Tree analyses
   */
  async listCausalTree(filter?: CausalTreeAnalysisFilter): Promise<CausalTreeAnalysisListResponse> {
    const query = this.toQueryString(filter as Record<string, unknown>);
    return this.request<CausalTreeAnalysisListResponse>(`/analysis/causal-tree${query}`);
  }

  /**
   * Create Causal Tree analysis
   */
  async createCausalTree(data: CreateCausalTreeAnalysisDTO): Promise<CausalTreeAnalysis> {
    return this.request<CausalTreeAnalysis>('/analysis/causal-tree', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get Causal Tree analysis by ID
   */
  async getCausalTreeById(id: string): Promise<CausalTreeAnalysis> {
    return this.request<CausalTreeAnalysis>(`/analysis/causal-tree/${id}`);
  }

  /**
   * Update Causal Tree analysis
   */
  async updateCausalTree(id: string, data: UpdateCausalTreeAnalysisDTO): Promise<CausalTreeAnalysis> {
    return this.request<CausalTreeAnalysis>(`/analysis/causal-tree/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete Causal Tree analysis
   */
  async deleteCausalTree(id: string): Promise<void> {
    return this.request<void>(`/analysis/causal-tree/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get nodes for a Causal Tree analysis
   */
  async getCausalTreeNodes(analysisId: string): Promise<CausalNode[]> {
    return this.request<CausalNode[]>(`/analysis/causal-tree/${analysisId}/nodes`);
  }

  /**
   * Add node to Causal Tree
   */
  async addCausalTreeNode(analysisId: string, data: AddCausalNodeDTO): Promise<CausalNode> {
    return this.request<CausalNode>(`/analysis/causal-tree/${analysisId}/nodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update Causal Tree node
   */
  async updateCausalTreeNode(analysisId: string, nodeId: string, data: UpdateCausalNodeDTO): Promise<CausalNode> {
    return this.request<CausalNode>(`/analysis/causal-tree/${analysisId}/nodes/${nodeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete Causal Tree node
   */
  async deleteCausalTreeNode(analysisId: string, nodeId: string): Promise<void> {
    return this.request<void>(`/analysis/causal-tree/${analysisId}/nodes/${nodeId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Mark node as root cause
   */
  async markNodeAsRootCause(analysisId: string, nodeId: string): Promise<CausalNode> {
    return this.request<CausalNode>(`/analysis/causal-tree/${analysisId}/nodes/${nodeId}/mark-root-cause`, {
      method: 'POST',
    });
  }

  /**
   * Get preventive measures for a Causal Tree analysis
   */
  async getCausalTreeMeasures(analysisId: string): Promise<PreventiveMeasure[]> {
    return this.request<PreventiveMeasure[]>(`/analysis/causal-tree/${analysisId}/measures`);
  }

  /**
   * Add preventive measure
   */
  async addCausalTreeMeasure(analysisId: string, data: AddPreventiveMeasureDTO): Promise<PreventiveMeasure> {
    return this.request<PreventiveMeasure>(`/analysis/causal-tree/${analysisId}/measures`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update preventive measure
   */
  async updateCausalTreeMeasure(analysisId: string, measureId: string, data: UpdatePreventiveMeasureDTO): Promise<PreventiveMeasure> {
    return this.request<PreventiveMeasure>(`/analysis/causal-tree/${analysisId}/measures/${measureId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete preventive measure
   */
  async deleteCausalTreeMeasure(analysisId: string, measureId: string): Promise<void> {
    return this.request<void>(`/analysis/causal-tree/${analysisId}/measures/${measureId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Validate Causal Tree analysis
   */
  async validateCausalTree(analysisId: string, options?: { checkObjectivity?: boolean; checkLogic?: boolean; checkMeasures?: boolean }): Promise<CausalTreeValidation> {
    return this.request<CausalTreeValidation>(`/analysis/causal-tree/${analysisId}/validate`, {
      method: 'POST',
      body: JSON.stringify(options || { checkObjectivity: true, checkLogic: true, checkMeasures: true }),
    });
  }

  /**
   * Complete Causal Tree analysis
   */
  async completeCausalTree(analysisId: string, rootCauses?: string[]): Promise<CausalTreeAnalysis> {
    return this.request<CausalTreeAnalysis>(`/analysis/causal-tree/${analysisId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ rootCauses }),
    });
  }

  /**
   * Get Causal Tree metrics
   */
  async getCausalTreeMetrics(): Promise<CausalTreeMetrics> {
    return this.request<CausalTreeMetrics>('/analysis/causal-tree/metrics');
  }
}