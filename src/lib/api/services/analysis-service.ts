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
    const response = await this.request<{ analyses?: FishboneAnalysis[]; Analyses?: FishboneAnalysis[] } | FishboneAnalysis[]>(`/analysis/fishbone${query}`);
    // Backend returns { analyses, total, limit, offset } - extract the array
    if (Array.isArray(response)) {
      return response;
    }
    return response.analyses || response.Analyses || [];
  }

  /**
   * List all Five Whys analyses
   */
  async listFiveWhys(params?: { status?: string; search?: string }): Promise<FiveWhysAnalysis[]> {
    const query = this.toQueryString(params);
    const response = await this.request<{ analyses?: FiveWhysAnalysis[]; Analyses?: FiveWhysAnalysis[] } | FiveWhysAnalysis[]>(`/analysis/five-whys${query}`);
    // Backend returns { analyses, total, limit, offset } - extract the array
    if (Array.isArray(response)) {
      return response;
    }
    return response.analyses || response.Analyses || [];
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
    // Fishbone module uses camelCase for JSON
    const payload = {
      incidentId: data.incidentId,
      title: data.title,
      problem: data.problem,
      categories: data.categories,
    };
    return this.request<FishboneAnalysis>('/analysis/fishbone', {
      method: 'POST',
      body: JSON.stringify(payload),
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
   * Delete Fishbone analysis
   */
  async deleteFishbone(id: string): Promise<void> {
    return this.request<void>(`/analysis/fishbone/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add a single cause to Fishbone analysis
   */
  async addFishboneCause(id: string, cause: {
    category: string;
    description: string;
    level?: number;
    parentId?: string;
    evidence?: string[];
    impact?: string;
    likelihood?: string;
    priority?: number;
    notes?: string;
  }): Promise<FishboneCause> {
    // Build the cause object with required fields and sensible defaults
    const payload = {
      analysisId: id,
      category: cause.category,
      description: cause.description,
      level: cause.level || 1,
      parentId: cause.parentId || null,
      evidence: cause.evidence || [],
      impact: cause.impact || 'medium',
      likelihood: cause.likelihood || 'medium',
      priority: cause.priority || 5,
      notes: cause.notes || null,
    };
    return this.request<FishboneCause>(`/analysis/fishbone/${id}/causes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Update a cause in Fishbone analysis
   */
  async updateFishboneCause(analysisId: string, causeId: string, data: {
    description?: string;
    impact?: string;
    likelihood?: string;
    priority?: number;
    notes?: string;
  }): Promise<FishboneCause> {
    return this.request<FishboneCause>(`/analysis/fishbone/${analysisId}/causes/${causeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a cause from Fishbone analysis
   */
  async deleteFishboneCause(analysisId: string, causeId: string): Promise<void> {
    return this.request<void>(`/analysis/fishbone/${analysisId}/causes/${causeId}`, {
      method: 'DELETE',
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

  // ============================================================================
  // Export Methods
  // ============================================================================

  /**
   * Export Fishbone analysis to PDF or DOCX format
   * Downloads the file with the specified filename
   */
  async exportFishbone(id: string, format: 'pdf' | 'docx', filename: string): Promise<void> {
    return this.downloadRequest(
      `/exports/analysis/fishbone/${id}/${format}`,
      filename
    );
  }

  /**
   * Export Causal Tree analysis to PDF or DOCX format
   * Downloads the file with the specified filename
   */
  async exportCausalTree(id: string, format: 'pdf' | 'docx', filename: string): Promise<void> {
    return this.downloadRequest(
      `/exports/analysis/causal-tree/${id}/${format}`,
      filename
    );
  }

  /**
   * Export Five Whys analysis to PDF or DOCX format
   * Downloads the file with the specified filename
   */
  async exportFiveWhys(id: string, format: 'pdf' | 'docx', filename: string): Promise<void> {
    return this.downloadRequest(
      `/exports/analysis/five-whys/${id}/${format}`,
      filename
    );
  }
}