/**
 * Common helper functions for report exports
 */

import { TableCell, Paragraph, TextRun, WidthType, BorderStyle, AlignmentType } from 'docx'

// ============================================
// FILENAME HELPERS
// ============================================

/**
 * Sanitize a string for use in filename (remove invalid characters)
 */
export function sanitizeForFilename(str: string): string {
  return str
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Format date as DD-MM-YYYY for filenames
 */
export function formatDateForFilename(date: string | Date | undefined): string {
  if (!date) {
    const now = new Date()
    return `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
  }
  const d = new Date(date)
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
}

export interface ExportMetadata {
  empresa?: string
  fecha?: string
  correlativo?: string
}

/**
 * Generate filename with format: [Empresa] Reporte [Tipo] [Fecha] [Correlativo].[ext]
 */
export function generateExportFilename(
  reportType: string,
  format: 'docx' | 'pdf' | 'xlsx',
  metadata?: ExportMetadata
): string {
  const parts: string[] = []

  // Empresa
  if (metadata?.empresa) {
    parts.push(sanitizeForFilename(metadata.empresa))
  }

  // "Reporte" + Tipo
  parts.push(`Reporte ${reportType}`)

  // Fecha
  parts.push(formatDateForFilename(metadata?.fecha))

  // Correlativo
  if (metadata?.correlativo) {
    parts.push(sanitizeForFilename(metadata.correlativo))
  }

  return `${parts.join(' ')}.${format}`
}

// ============================================
// DATE & NUMBER FORMATTING
// ============================================

/**
 * Format date for display in documents
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format date as DD/MM/YYYY
 */
export function formatDateShort(date: string | Date | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

/**
 * Format currency as CLP
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-'
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(value)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-'
  return `${Math.round(value)}%`
}

// ============================================
// STATUS LABELS
// ============================================

/**
 * Get Spanish label for report status
 */
export function getStatusLabel(status: string | undefined): string {
  if (!status) return '-'
  const labels: Record<string, string> = {
    draft: 'Borrador',
    submitted: 'Enviado',
    under_review: 'En Revisión',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    published: 'Publicado',
    closed: 'Cerrado',
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  }
  return labels[status.toLowerCase()] || status
}

/**
 * Get Spanish label for action item status
 */
export function getActionStatusLabel(status: string | undefined): string {
  if (!status) return '-'
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
    delayed: 'Retrasado',
    on_hold: 'En Espera',
  }
  return labels[status.toLowerCase()] || status
}

// ============================================
// DOCX TABLE HELPERS
// ============================================

const defaultBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
}

/**
 * Create a table cell with consistent styling
 */
export function createCell(
  text: string,
  options?: {
    bold?: boolean
    width?: number
    shading?: string
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]
  }
): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: options?.bold, size: 22 })],
        alignment: options?.alignment,
      }),
    ],
    width: options?.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
    shading: options?.shading ? { fill: options.shading } : undefined,
    borders: defaultBorders,
  })
}

/**
 * Create a header cell (bold, with background)
 */
export function createHeaderCell(text: string, width?: number): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [new TextRun({ text, bold: true, size: 22, color: 'FFFFFF' })],
        alignment: AlignmentType.CENTER,
      }),
    ],
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: { fill: '1565C0' },
    borders: defaultBorders,
  })
}

/**
 * Create a label cell (bold, gray background)
 */
export function createLabelCell(text: string, width?: number): TableCell {
  return createCell(text, { bold: true, width, shading: 'F5F5F5' })
}

// ============================================
// HTML/PDF HELPERS
// ============================================

/**
 * Get common CSS styles for PDF export via HTML
 */
export function getCommonPDFStyles(): string {
  return `
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
      color: #333;
      font-size: 14px;
    }
    h1 {
      color: #1565C0;
      text-align: center;
      border-bottom: 3px solid #1565C0;
      padding-bottom: 15px;
      margin-bottom: 30px;
      font-size: 22px;
    }
    h2 {
      color: #424242;
      margin-top: 25px;
      margin-bottom: 15px;
      border-left: 4px solid #1565C0;
      padding-left: 12px;
      font-size: 16px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 13px;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background: #1565C0;
      color: white;
      font-weight: 600;
    }
    tr:nth-child(even) { background: #f9f9f9; }
    .info-table td:first-child {
      font-weight: bold;
      background: #f5f5f5;
      width: 25%;
    }
    .highlight-box {
      border-radius: 6px;
      padding: 12px 15px;
      margin: 10px 0;
    }
    .highlight-orange { background: #FFF3E0; border-left: 4px solid #FF9800; }
    .highlight-blue { background: #E3F2FD; border-left: 4px solid #2196F3; }
    .highlight-green { background: #E8F5E9; border-left: 4px solid #4CAF50; }
    .highlight-pink { background: #FCE4EC; border-left: 4px solid #E91E63; }
    .highlight-red { background: #FFEBEE; border-left: 4px solid #F44336; }
    .total-row { background: #E8F5E9 !important; font-weight: bold; }
    .status-completed { color: #2E7D32; }
    .status-pending { color: #F57C00; }
    .status-in-progress { color: #1976D2; }
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #ddd;
      text-align: right;
      color: #666;
      font-size: 11px;
    }
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge-blue { background: #E3F2FD; color: #1565C0; }
    .badge-green { background: #E8F5E9; color: #2E7D32; }
    .badge-orange { background: #FFF3E0; color: #E65100; }
    @media print {
      body { padding: 15px; }
      h2 { break-after: avoid; }
      table { break-inside: avoid; }
      .page-break { page-break-before: always; }
    }
  `
}

/**
 * Open HTML content in a new window for printing/PDF
 */
export function openPrintWindow(html: string): void {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}
