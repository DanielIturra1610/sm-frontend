import { env } from '@/lib/env';

export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'xlsx';

export type ReportType =
  | 'flash-reports'
  | 'immediate-actions'
  | 'root-cause'
  | 'action-plan'
  | 'zero-tolerance'
  | 'final-reports';

class ExportService {
  private baseURL = env.NEXT_PUBLIC_API_URL;

  /**
   * Get authentication token
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth-token') || sessionStorage.getItem('auth-token');
  }

  /**
   * Export a report to PDF or DOCX format
   * @param reportType - The type of report to export
   * @param reportId - The ID of the report
   * @param format - The export format (pdf or docx)
   */
  async exportReport(
    reportType: ReportType,
    reportId: string,
    format: ExportFormat
  ): Promise<Blob> {
    const endpoint = `/exports/${reportType}/${reportId}/${format}`;
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Export failed: ${response.status} - ${errorText}`);
    }

    return response.blob();
  }

  /**
   * Download a report by triggering a browser download
   * @param reportType - The type of report
   * @param reportId - The ID of the report
   * @param format - The export format
   * @param filename - Optional custom filename (will be generated if not provided)
   */
  async downloadReport(
    reportType: ReportType,
    reportId: string,
    format: ExportFormat,
    filename?: string
  ): Promise<void> {
    try {
      const blob = await this.exportReport(reportType, reportId, format);

      // Generate filename if not provided
      const finalFilename = filename || this.generateFilename(reportType, reportId, format);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }

  /**
   * Generate a filename for the export
   */
  private generateFilename(
    reportType: ReportType,
    reportId: string,
    format: ExportFormat
  ): string {
    const typeLabel = reportType.replace(/-/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    return `${typeLabel}_${reportId}_${timestamp}.${format}`;
  }
}

export const exportService = new ExportService();
