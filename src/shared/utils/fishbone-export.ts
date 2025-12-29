import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, WidthType, BorderStyle, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import type { FishboneAnalysis, FishboneCause } from '@/shared/types/api'

// Extended type to handle optional status from API response
interface FishboneAnalysisWithStatus extends FishboneAnalysis {
  status?: string
}

// Metadata for filename generation
export interface FishboneExportMetadata {
  empresa?: string
  fecha?: string
  correlativo?: string
}

/**
 * Sanitize a string for use in filename (remove invalid characters)
 */
function sanitizeForFilename(str: string): string {
  return str
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
}

/**
 * Generate a filename for the export
 * Format: [Empresa] Reporte Diagrama Ishikawa [Fecha] [Correlativo].[Extension]
 */
function generateFilename(format: 'xlsx' | 'docx' | 'pdf', metadata?: FishboneExportMetadata): string {
  const parts: string[] = []

  // Empresa
  if (metadata?.empresa) {
    parts.push(sanitizeForFilename(metadata.empresa))
  }

  // "Reporte" + Tipo
  parts.push('Reporte Diagrama Ishikawa')

  // Fecha (from metadata or current date)
  const fecha = metadata?.fecha || new Date().toISOString().split('T')[0]
  parts.push(fecha)

  // Correlativo
  if (metadata?.correlativo) {
    parts.push(sanitizeForFilename(metadata.correlativo))
  }

  return `${parts.join(' ')}.${format}`
}

// Category labels in Spanish
const CATEGORY_LABELS: Record<string, string> = {
  people: 'Mano de Obra',
  mano_de_obra: 'Mano de Obra',
  method: 'Método',
  metodo: 'Método',
  machine: 'Maquinaria',
  maquinaria: 'Maquinaria',
  material: 'Material',
  measurement: 'Medición',
  medicion: 'Medición',
  environment: 'Medio Ambiente',
  medio_ambiente: 'Medio Ambiente',
}

// Helper to format date
function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Helper to get status label
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Borrador',
    in_review: 'En Revisión',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    completed: 'Completado',
  }
  return labels[status] || status
}

// Helper to get category label
function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category?.toLowerCase()] || category
}

// Helper to get impact label
function getImpactLabel(impact: string): string {
  const labels: Record<string, string> = {
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo',
  }
  return labels[impact?.toLowerCase()] || impact
}

// Helper to get likelihood label
function getLikelihoodLabel(likelihood: string): string {
  const labels: Record<string, string> = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  }
  return labels[likelihood?.toLowerCase()] || likelihood
}

// Group causes by category
function groupCausesByCategory(causes: FishboneCause[]): Record<string, FishboneCause[]> {
  const grouped: Record<string, FishboneCause[]> = {}

  causes.forEach(cause => {
    const category = cause.category?.toLowerCase() || 'other'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(cause)
  })

  return grouped
}

// ============================================
// EXCEL EXPORT
// ============================================
export async function exportToExcel(analysis: FishboneAnalysisWithStatus, metadata?: FishboneExportMetadata): Promise<void> {
  const workbook = XLSX.utils.book_new()
  const causes = analysis.causes || []
  const groupedCauses = groupCausesByCategory(causes)

  // ========== Sheet 1: Resumen del Análisis ==========
  const summaryData: (string | number)[][] = []

  summaryData.push(['DIAGRAMA DE ISHIKAWA (6M)'])
  summaryData.push([])
  summaryData.push(['Información General'])
  summaryData.push(['Título:', analysis.title || 'Sin título'])
  summaryData.push(['Problema:', analysis.problem || '-'])
  summaryData.push(['Estado:', getStatusLabel(analysis.status || 'draft')])
  summaryData.push(['Fecha de Creación:', formatDate(analysis.createdAt)])
  summaryData.push(['Última Actualización:', formatDate(analysis.updatedAt)])
  summaryData.push([])

  // Statistics
  summaryData.push(['Estadísticas'])
  summaryData.push(['Total de Causas:', causes.length])
  summaryData.push(['Causas de Alto Impacto:', causes.filter(c => c.impact === 'high').length])
  summaryData.push(['Causas de Alta Probabilidad:', causes.filter(c => c.likelihood === 'high').length])
  summaryData.push([])

  // Causes by category summary
  summaryData.push(['Causas por Categoría'])
  Object.entries(groupedCauses).forEach(([category, categoryCauses]) => {
    summaryData.push([getCategoryLabel(category) + ':', categoryCauses.length])
  })

  if (analysis.conclusions) {
    summaryData.push([])
    summaryData.push(['Conclusiones'])
    summaryData.push([analysis.conclusions])
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 60 }]
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')

  // ========== Sheet 2: Lista de Causas ==========
  const causesData: (string | number)[][] = []
  causesData.push(['#', 'Categoría', 'Descripción', 'Impacto', 'Probabilidad', 'Prioridad', 'Notas'])

  causes.forEach((cause, index) => {
    causesData.push([
      index + 1,
      getCategoryLabel(cause.category),
      cause.description,
      getImpactLabel(cause.impact),
      getLikelihoodLabel(cause.likelihood),
      cause.priority || '-',
      cause.notes || '-',
    ])
  })

  const causesSheet = XLSX.utils.aoa_to_sheet(causesData)
  causesSheet['!cols'] = [
    { wch: 5 },   // #
    { wch: 18 },  // Categoría
    { wch: 50 },  // Descripción
    { wch: 10 },  // Impacto
    { wch: 12 },  // Probabilidad
    { wch: 10 },  // Prioridad
    { wch: 30 },  // Notas
  ]
  XLSX.utils.book_append_sheet(workbook, causesSheet, 'Lista de Causas')

  // ========== Sheet 3: Causas por Categoría ==========
  const categoryOrder = ['mano_de_obra', 'people', 'maquinaria', 'machine', 'metodo', 'method', 'material', 'medicion', 'measurement', 'medio_ambiente', 'environment']
  const byCategoryData: (string | number)[][] = []
  byCategoryData.push(['CAUSAS POR CATEGORÍA (6M)'])
  byCategoryData.push([])

  categoryOrder.forEach(cat => {
    const categoryCauses = groupedCauses[cat]
    if (categoryCauses && categoryCauses.length > 0) {
      byCategoryData.push([getCategoryLabel(cat).toUpperCase()])
      byCategoryData.push(['#', 'Descripción', 'Impacto', 'Probabilidad', 'Prioridad'])

      categoryCauses.forEach((cause, idx) => {
        byCategoryData.push([
          idx + 1,
          cause.description,
          getImpactLabel(cause.impact),
          getLikelihoodLabel(cause.likelihood),
          cause.priority || '-',
        ])
      })
      byCategoryData.push([])
    }
  })

  const byCategorySheet = XLSX.utils.aoa_to_sheet(byCategoryData)
  byCategorySheet['!cols'] = [{ wch: 5 }, { wch: 50 }, { wch: 10 }, { wch: 12 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(workbook, byCategorySheet, 'Por Categoría')

  // Generate and save file
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const filename = generateFilename('xlsx', metadata)
  saveAs(blob, filename)
}

// ============================================
// WORD EXPORT
// ============================================
export async function exportToWord(analysis: FishboneAnalysisWithStatus, metadata?: FishboneExportMetadata): Promise<void> {
  const causes = analysis.causes || []
  const groupedCauses = groupCausesByCategory(causes)
  const children: (Paragraph | Table)[] = []

  // Title
  children.push(
    new Paragraph({
      text: 'DIAGRAMA DE ISHIKAWA (6M)',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  )

  // Subtitle with problem
  if (analysis.problem) {
    children.push(
      new Paragraph({
        text: 'Análisis de Causa Raíz',
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    )
  }

  // General Info Section
  children.push(
    new Paragraph({
      text: 'Información General',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  )

  const infoRows = [
    ['Título:', analysis.title || 'Sin título'],
    ['Problema:', analysis.problem || '-'],
    ['Estado:', getStatusLabel(analysis.status || 'draft')],
    ['Fecha de Creación:', formatDate(analysis.createdAt)],
    ['Total de Causas:', String(causes.length)],
  ]

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: infoRows.map(([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
              width: { size: 30, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
            }),
            new TableCell({
              children: [new Paragraph({ text: value })],
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
            }),
          ],
        })
      ),
    })
  )

  // Problem Section
  children.push(
    new Paragraph({
      text: 'Problema Analizado',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: analysis.problem || 'No especificado',
          size: 24,
        }),
      ],
      spacing: { after: 200 },
      shading: { fill: 'FFF3E0' },
    })
  )

  // Causes by Category
  const categoryOrder = ['mano_de_obra', 'people', 'maquinaria', 'machine', 'metodo', 'method', 'material', 'medicion', 'measurement', 'medio_ambiente', 'environment']

  children.push(
    new Paragraph({
      text: 'Causas Identificadas por Categoría',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  )

  categoryOrder.forEach(cat => {
    const categoryCauses = groupedCauses[cat]
    if (categoryCauses && categoryCauses.length > 0) {
      // Category header
      children.push(
        new Paragraph({
          text: getCategoryLabel(cat),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 300, after: 100 },
        })
      )

      // Causes table for this category
      const headerRow = new TableRow({
        children: ['#', 'Descripción', 'Impacto', 'Probabilidad'].map(text =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
            shading: { fill: '1976D2' },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          })
        ),
      })

      const dataRows = categoryCauses.map((cause, idx) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: String(idx + 1), alignment: AlignmentType.CENTER })],
              width: { size: 8, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
            }),
            new TableCell({
              children: [new Paragraph({ text: cause.description })],
              width: { size: 52, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
            }),
            new TableCell({
              children: [new Paragraph({ text: getImpactLabel(cause.impact) })],
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: cause.impact === 'high' ? { fill: 'FFCDD2' } : cause.impact === 'medium' ? { fill: 'FFF9C4' } : { fill: 'C8E6C9' },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
            }),
            new TableCell({
              children: [new Paragraph({ text: getLikelihoodLabel(cause.likelihood) })],
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: cause.likelihood === 'high' ? { fill: 'FFCDD2' } : cause.likelihood === 'medium' ? { fill: 'FFF9C4' } : { fill: 'C8E6C9' },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
              },
            }),
          ],
        })
      )

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [headerRow, ...dataRows],
        })
      )
    }
  })

  // Conclusions
  if (analysis.conclusions) {
    children.push(
      new Paragraph({
        text: 'Conclusiones',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    )

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: analysis.conclusions,
            size: 24,
          }),
        ],
        spacing: { after: 200 },
        shading: { fill: 'E8F5E9' },
      })
    )
  }

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generado el ${formatDate(new Date())}`,
          size: 20,
          italics: true,
        }),
      ],
      spacing: { before: 600 },
      alignment: AlignmentType.RIGHT,
    })
  )

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  })

  // Generate and save
  const buffer = await Packer.toBuffer(doc)
  const uint8Array = new Uint8Array(buffer)
  const blob = new Blob([uint8Array], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  const filename = generateFilename('docx', metadata)
  saveAs(blob, filename)
}

// ============================================
// PDF EXPORT (via HTML print)
// ============================================
export async function exportToPDF(analysis: FishboneAnalysisWithStatus, metadata?: FishboneExportMetadata): Promise<void> {
  const causes = analysis.causes || []
  const groupedCauses = groupCausesByCategory(causes)
  const categoryOrder = ['mano_de_obra', 'people', 'maquinaria', 'machine', 'metodo', 'method', 'material', 'medicion', 'measurement', 'medio_ambiente', 'environment']
  const pdfFilename = generateFilename('pdf', metadata).replace('.pdf', '')

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${pdfFilename}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.6;
          padding: 40px;
          max-width: 900px;
          margin: 0 auto;
          color: #333;
        }
        h1 {
          color: #1976D2;
          text-align: center;
          border-bottom: 3px solid #1976D2;
          padding-bottom: 15px;
          margin-bottom: 30px;
        }
        h2 {
          color: #424242;
          margin-top: 30px;
          border-left: 4px solid #1976D2;
          padding-left: 12px;
        }
        h3 {
          color: #1976D2;
          margin-top: 20px;
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 14px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 10px 8px;
          text-align: left;
        }
        th {
          background: #1976D2;
          color: white;
          font-weight: 600;
        }
        tr:nth-child(even) { background: #f9f9f9; }
        .problem-box {
          background: #FFF3E0;
          border: 2px solid #FF9800;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
          text-align: center;
        }
        .problem-box p {
          font-size: 18px;
          font-weight: bold;
          color: #E65100;
          margin: 0;
        }
        .info-table td:first-child {
          font-weight: bold;
          background: #f5f5f5;
          width: 30%;
        }
        .impact-high { background: #FFCDD2; color: #C62828; }
        .impact-medium { background: #FFF9C4; color: #F57F17; }
        .impact-low { background: #C8E6C9; color: #2E7D32; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        .stat-box {
          border: 2px solid #1976D2;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
          background: #E3F2FD;
        }
        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #1976D2;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
        .category-section {
          margin: 20px 0;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }
        .category-header {
          background: #f5f5f5;
          padding: 12px 15px;
          font-weight: bold;
          border-bottom: 1px solid #e0e0e0;
        }
        .category-header.people { border-left: 4px solid #2196F3; }
        .category-header.method { border-left: 4px solid #4CAF50; }
        .category-header.machine { border-left: 4px solid #9C27B0; }
        .category-header.material { border-left: 4px solid #FF9800; }
        .category-header.measurement { border-left: 4px solid #E91E63; }
        .category-header.environment { border-left: 4px solid #009688; }
        .conclusions-box {
          background: #E8F5E9;
          border: 2px solid #4CAF50;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          text-align: right;
          color: #666;
          font-size: 12px;
          font-style: italic;
        }
        @media print {
          body { padding: 20px; }
          .category-section { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>DIAGRAMA DE ISHIKAWA (6M)</h1>

      <h2>Información General</h2>
      <table class="info-table">
        <tr><td>Título:</td><td>${analysis.title || 'Sin título'}</td></tr>
        <tr><td>Estado:</td><td>${getStatusLabel(analysis.status || 'draft')}</td></tr>
        <tr><td>Fecha de Creación:</td><td>${formatDate(analysis.createdAt)}</td></tr>
        <tr><td>Última Actualización:</td><td>${formatDate(analysis.updatedAt)}</td></tr>
      </table>

      <h2>Problema Analizado</h2>
      <div class="problem-box">
        <p>${analysis.problem || 'No especificado'}</p>
      </div>

      <h2>Estadísticas</h2>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${causes.length}</div>
          <div class="stat-label">Total de Causas</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${causes.filter(c => c.impact === 'high').length}</div>
          <div class="stat-label">Alto Impacto</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${causes.filter(c => c.likelihood === 'high').length}</div>
          <div class="stat-label">Alta Probabilidad</div>
        </div>
      </div>

      <h2>Causas Identificadas por Categoría</h2>
      ${categoryOrder.map(cat => {
        const categoryCauses = groupedCauses[cat]
        if (!categoryCauses || categoryCauses.length === 0) return ''

        const categoryClass = cat.includes('people') || cat.includes('mano') ? 'people' :
                             cat.includes('method') || cat.includes('metodo') ? 'method' :
                             cat.includes('machine') || cat.includes('maquinaria') ? 'machine' :
                             cat.includes('material') ? 'material' :
                             cat.includes('measurement') || cat.includes('medicion') ? 'measurement' : 'environment'

        return `
          <div class="category-section">
            <div class="category-header ${categoryClass}">
              ${getCategoryLabel(cat)} (${categoryCauses.length} causas)
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 40px;">#</th>
                  <th>Descripción</th>
                  <th style="width: 80px;">Impacto</th>
                  <th style="width: 100px;">Probabilidad</th>
                </tr>
              </thead>
              <tbody>
                ${categoryCauses.map((cause, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${cause.description}</td>
                    <td class="impact-${cause.impact}">${getImpactLabel(cause.impact)}</td>
                    <td class="impact-${cause.likelihood}">${getLikelihoodLabel(cause.likelihood)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `
      }).join('')}

      ${analysis.conclusions ? `
        <h2>Conclusiones</h2>
        <div class="conclusions-box">
          <p>${analysis.conclusions}</p>
        </div>
      ` : ''}

      <div class="footer">
        Generado el ${formatDate(new Date())}
      </div>
    </body>
    </html>
  `

  // Create a new window and print
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }
}
