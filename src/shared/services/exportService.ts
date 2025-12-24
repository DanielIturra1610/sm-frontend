import { env } from '@/lib/env';

export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'xlsx';

export type ReportType =
  | 'flash-reports'
  | 'immediate-actions'
  | 'root-cause'
  | 'action-plan'
  | 'zero-tolerance'
  | 'final-reports';

export interface ReportMetadata {
  empresa?: string;
  tipoIncidente?: string;
  fecha?: string;
  correlativo?: string;
}

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
   * @param metadata - Optional metadata for filename generation
   */
  async downloadReport(
    reportType: ReportType,
    reportId: string,
    format: ExportFormat,
    metadata?: ReportMetadata
  ): Promise<void> {
    try {
      const blob = await this.exportReport(reportType, reportId, format);

      // Generate filename using metadata
      const finalFilename = this.generateFilename(reportType, format, metadata);

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
   * Get the Spanish label for report type
   */
  private getReportTypeLabel(reportType: ReportType): string {
    const labels: Record<ReportType, string> = {
      'flash-reports': 'Flash',
      'immediate-actions': 'Acciones Inmediatas',
      'root-cause': 'Causa Raiz',
      'action-plan': 'Plan de Accion',
      'zero-tolerance': 'Tolerancia Cero',
      'final-reports': 'Final',
    };
    return labels[reportType] || reportType;
  }

  /**
   * Sanitize a string for use in filename (remove invalid characters)
   */
  private sanitizeForFilename(str: string): string {
    return str
      .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Generate a filename for the export
   * Format: [Empresa] Reporte [Tipo] [Tipo Incidente] [Fecha] [Correlativo].[Extension]
   */
  private generateFilename(
    reportType: ReportType,
    format: ExportFormat,
    metadata?: ReportMetadata
  ): string {
    const parts: string[] = [];

    // Empresa
    if (metadata?.empresa) {
      parts.push(this.sanitizeForFilename(metadata.empresa));
    }

    // "Reporte" + Tipo
    parts.push(`Reporte ${this.getReportTypeLabel(reportType)}`);

    // Tipo Incidente
    if (metadata?.tipoIncidente) {
      parts.push(this.sanitizeForFilename(metadata.tipoIncidente));
    }

    // Fecha (from metadata or current date)
    const fecha = metadata?.fecha || new Date().toISOString().split('T')[0];
    parts.push(fecha);

    // Correlativo
    if (metadata?.correlativo) {
      parts.push(this.sanitizeForFilename(metadata.correlativo));
    }

    return `${parts.join(' ')}.${format}`;
  }
}

export const exportService = new ExportService();
