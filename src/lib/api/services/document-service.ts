/**
 * Document service for managing document generation and templates
 */

import { BaseService } from './base-service';
import type {
  Document,
  GenerateDocumentRequest,
  DocumentListResponse,
  DocumentTemplate,
} from '@/shared/types/api';

export class DocumentService extends BaseService {
  /**
   * Generate document
   */
  async generate(request: GenerateDocumentRequest): Promise<Document> {
    return this.request<Document>('/documents/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get document by ID
   */
  async getById(id: string): Promise<Document> {
    return this.request<Document>(`/documents/${id}`);
  }

  /**
   * Download document
   */
  async download(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/documents/${id}/download`, {
      headers: {
        Authorization: `Bearer ${await this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download document');
    }

    return response.blob();
  }

  /**
   * List documents
   */
  async list(params?: { type?: string; status?: string }): Promise<DocumentListResponse> {
    const queryString = this.toQueryString(params as Record<string, unknown>);
    return this.request<DocumentListResponse>(`/documents${queryString}`);
  }

  /**
   * Create document template
   */
  async createTemplate(data: DocumentTemplate): Promise<DocumentTemplate> {
    return this.request<DocumentTemplate>('/documents/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * List document templates
   */
  async listTemplates(): Promise<DocumentTemplate[]> {
    return this.request<DocumentTemplate[]>('/documents/templates');
  }

  /**
   * Sign document
   */
  async sign(id: string, signatureData: Record<string, unknown>): Promise<Document> {
    return this.request<Document>(`/documents/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify(signatureData),
    });
  }

  /**
   * Approve document
   */
  async approve(id: string, approvalData: Record<string, unknown>): Promise<Document> {
    return this.request<Document>(`/documents/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(approvalData),
    });
  }
}