/**
 * Attachment Service for photo/file handling
 */

import { BaseService, ServiceConfig } from './base-service';
import { env } from '@/lib/env';

// ============================================================================
// TYPES
// ============================================================================

export interface EnhancedAttachment {
  id: string;
  incident_id: string;
  tenant_id: string;
  s3_key: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  uploaded_by_id: string;
  category: 'photo' | 'document' | 'video' | 'audio';
  description?: string;
  caption?: string;
  report_id?: string;
  report_type?: string;
  thumbnail_key?: string;
  include_in_final: boolean;
  final_report_order?: number;
  photo_width?: number;
  photo_height?: number;
  taken_at?: string;
  created_at: string;
  updated_at: string;
  // Computed fields from signed URLs
  signed_url?: string;
  thumbnail_signed_url?: string;
}

export interface UploadAttachmentParams {
  file: File;
  incident_id: string;
  description?: string;
  caption?: string;
  report_id?: string;
  report_type?: string;
}

export interface UpdateAttachmentParams {
  description?: string;
  caption?: string;
  include_in_final?: boolean;
  final_report_order?: number;
}

export interface ReorderAttachmentParams {
  id: string;
  order: number;
}

export interface SignedURLResponse {
  url: string;
  thumbnail_url?: string;
}

// ============================================================================
// SERVICE
// ============================================================================

export class AttachmentService extends BaseService {
  constructor(config: ServiceConfig) {
    super(config);
  }

  /**
   * Upload a file attachment
   */
  async upload(params: UploadAttachmentParams): Promise<EnhancedAttachment> {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('incident_id', params.incident_id);

    if (params.description) {
      formData.append('description', params.description);
    }
    if (params.caption) {
      formData.append('caption', params.caption);
    }
    if (params.report_id) {
      formData.append('report_id', params.report_id);
    }
    if (params.report_type) {
      formData.append('report_type', params.report_type);
    }

    return this.uploadRequest<EnhancedAttachment>('/api/v1/attachments', formData);
  }

  /**
   * Get attachment by ID
   */
  async getById(id: string): Promise<EnhancedAttachment> {
    return this.request<EnhancedAttachment>(`/api/v1/attachments/${id}`);
  }

  /**
   * Get all attachments for an incident
   */
  async getByIncidentId(incidentId: string): Promise<EnhancedAttachment[]> {
    return this.request<EnhancedAttachment[]>(`/api/v1/attachments/incident/${incidentId}`);
  }

  /**
   * Get only photo attachments for an incident
   */
  async getPhotosByIncidentId(incidentId: string): Promise<EnhancedAttachment[]> {
    return this.request<EnhancedAttachment[]>(`/api/v1/attachments/incident/${incidentId}/photos`);
  }

  /**
   * Get photos marked for final report inclusion
   */
  async getForFinalReport(incidentId: string): Promise<EnhancedAttachment[]> {
    return this.request<EnhancedAttachment[]>(`/api/v1/attachments/incident/${incidentId}/final-report`);
  }

  /**
   * Update attachment metadata
   */
  async update(id: string, params: UpdateAttachmentParams): Promise<EnhancedAttachment> {
    return this.request<EnhancedAttachment>(`/api/v1/attachments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(params),
    });
  }

  /**
   * Reorder attachments for final report
   */
  async reorder(attachments: ReorderAttachmentParams[]): Promise<void> {
    await this.request<{ status: string }>('/api/v1/attachments/reorder', {
      method: 'PUT',
      body: JSON.stringify({ attachments }),
    });
  }

  /**
   * Delete an attachment
   */
  async delete(id: string): Promise<void> {
    await this.request<{ status: string }>(`/api/v1/attachments/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get signed URL for direct download
   */
  async getSignedURL(id: string): Promise<SignedURLResponse> {
    return this.request<SignedURLResponse>(`/api/v1/attachments/${id}/url`);
  }

  /**
   * Helper: Upload multiple files
   */
  async uploadMultiple(incidentId: string, files: File[]): Promise<EnhancedAttachment[]> {
    const results: EnhancedAttachment[] = [];

    for (const file of files) {
      const attachment = await this.upload({
        file,
        incident_id: incidentId,
      });
      results.push(attachment);
    }

    return results;
  }

  /**
   * Helper: Check if file is an image
   */
  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Helper: Get file category from MIME type
   */
  getCategoryFromMimeType(mimeType: string): 'photo' | 'document' | 'video' | 'audio' {
    if (mimeType.startsWith('image/')) return 'photo';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  }

  /**
   * Helper: Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  /**
   * Special request method for file uploads (FormData)
   */
  private async uploadRequest<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = await this.getToken();

    const headers: Record<string, string> = {};
    // Don't set Content-Type for FormData - browser will set it with boundary

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (env.NEXT_PUBLIC_SHOW_API_LOGS) {
      console.log(`🔌 API Upload Request [POST]:`, url);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (response.status === 401) {
      await this.redirectToLogin();
      throw new Error('Unauthorized - redirecting to login');
    }

    const responseData = await response.json();

    if (env.NEXT_PUBLIC_SHOW_API_LOGS) {
      console.log(`🔌 API Upload Response [${response.status}]:`, responseData);
    }

    if (!response.ok) {
      throw new Error(responseData.error || `Upload failed with status ${response.status}`);
    }

    // Handle wrapped response
    return (responseData && typeof responseData === 'object' && 'data' in responseData)
      ? responseData.data as T
      : responseData as T;
  }
}
