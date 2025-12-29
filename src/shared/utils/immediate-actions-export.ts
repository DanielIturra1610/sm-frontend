/**
 * Immediate Actions Report Export Utilities
 * Exports Immediate Actions Reports to Word (DOCX) and PDF formats
 */

import { Document, Packer, Paragraph, Table, TableRow, TextRun, HeadingLevel, WidthType } from 'docx'
import { saveAs } from 'file-saver'
import type { ImmediateActionsReport, ImmediateActionItem } from '@/shared/types/api'
import {
  generateExportFilename,
  formatDate,
  formatDateShort,
  formatPercentage,
  getStatusLabel,
  createCell,
  createHeaderCell,
  createLabelCell,
  getCommonPDFStyles,
  openPrintWindow,
  type ExportMetadata,
} from './export-helpers'

// ============================================
// HELPER FUNCTIONS
// ============================================

function getItemStatusColor(avance: number): string {
  if (avance >= 100) return 'C8E6C9' // Green
  if (avance >= 50) return 'FFF9C4' // Yellow
  return 'FFCDD2' // Red
}

function getItemStatusClass(avance: number): string {
  if (avance >= 100) return 'status-completed'
  if (avance >= 50) return 'status-in-progress'
  return 'status-pending'
}

// ============================================
// WORD EXPORT
// ============================================

export async function exportImmediateActionsToWord(
  report: ImmediateActionsReport,
  metadata?: ExportMetadata
): Promise<void> {
  const children: (Paragraph | Table)[] = []

  // Title
  children.push(
    new Paragraph({
      text: 'REPORTE DE ACCIONES INMEDIATAS',
      heading: HeadingLevel.HEADING_1,
      alignment: 'center' as const,
      spacing: { after: 400 },
    })
  )

  // Información General
  children.push(
    new Paragraph({
      text: '1. Información General',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  const infoRows = [
    ['Fecha Inicio:', formatDateShort(report.fecha_inicio)],
    ['Fecha Término:', formatDateShort(report.fecha_termino)],
    ['Avance General:', formatPercentage(report.porcentaje_avance_plan)],
    ['Estado:', getStatusLabel(report.report_status)],
  ]

  if (report.incident) {
    infoRows.unshift(['Incidente:', report.incident.descripcion_breve || report.incident.title || '-'])
    if (report.incident.correlativo) {
      infoRows.unshift(['Correlativo:', report.incident.correlativo])
    }
  }

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: infoRows.map(([label, value]) =>
        new TableRow({
          children: [
            createLabelCell(label, 25),
            createCell(value, { width: 75 }),
          ],
        })
      ),
    })
  )

  // Items de Acciones Inmediatas
  if (report.items && report.items.length > 0) {
    children.push(
      new Paragraph({
        text: '2. Acciones Inmediatas',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    const headerRow = new TableRow({
      children: [
        createHeaderCell('#', 5),
        createHeaderCell('Tarea', 30),
        createHeaderCell('Responsable', 15),
        createHeaderCell('Inicio', 10),
        createHeaderCell('Fin', 10),
        createHeaderCell('Avance Prog.', 10),
        createHeaderCell('Avance Real', 10),
        createHeaderCell('Comentario', 10),
      ],
    })

    const dataRows = report.items.map((item: ImmediateActionItem) =>
      new TableRow({
        children: [
          createCell(String(item.numero), { alignment: 'center' as const }),
          createCell(item.tarea || '-'),
          createCell(item.responsable || '-'),
          createCell(formatDateShort(item.inicio)),
          createCell(formatDateShort(item.fin)),
          createCell(formatPercentage(item.avance_programado), { alignment: 'center' as const }),
          createCell(formatPercentage(item.avance_real), {
            alignment: 'center' as const,
            shading: getItemStatusColor(item.avance_real),
          }),
          createCell(item.comentario || '-'),
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

  // Resumen
  children.push(
    new Paragraph({
      text: '3. Resumen',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  const totalItems = report.items?.length || 0
  const completedItems = report.items?.filter((i) => i.avance_real >= 100).length || 0
  const inProgressItems = report.items?.filter((i) => i.avance_real > 0 && i.avance_real < 100).length || 0
  const pendingItems = report.items?.filter((i) => i.avance_real === 0).length || 0

  const summaryRows = [
    ['Total de Acciones:', String(totalItems)],
    ['Completadas:', String(completedItems)],
    ['En Progreso:', String(inProgressItems)],
    ['Pendientes:', String(pendingItems)],
    ['Porcentaje de Avance:', formatPercentage(report.porcentaje_avance_plan)],
  ]

  children.push(
    new Table({
      width: { size: 50, type: WidthType.PERCENTAGE },
      rows: summaryRows.map(([label, value]) =>
        new TableRow({
          children: [
            createLabelCell(label, 60),
            createCell(value, { width: 40, alignment: 'center' as const }),
          ],
        })
      ),
    })
  )

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Generado el ${formatDate(new Date())}`, size: 20, italics: true }),
      ],
      alignment: 'right' as const,
      spacing: { before: 400 },
    })
  )

  // Create document
  const doc = new Document({
    sections: [{ properties: {}, children }],
  })

  // Generate and save
  const buffer = await Packer.toBuffer(doc)
  const blob = new Blob([new Uint8Array(buffer)], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  const filename = generateExportFilename('Acciones Inmediatas', 'docx', metadata)
  saveAs(blob, filename)
}

// ============================================
// PDF EXPORT
// ============================================

export async function exportImmediateActionsToPDF(
  report: ImmediateActionsReport,
  metadata?: ExportMetadata
): Promise<void> {
  const filename = generateExportFilename('Acciones Inmediatas', 'pdf', metadata).replace('.pdf', '')

  const totalItems = report.items?.length || 0
  const completedItems = report.items?.filter((i) => i.avance_real >= 100).length || 0
  const inProgressItems = report.items?.filter((i) => i.avance_real > 0 && i.avance_real < 100).length || 0
  const pendingItems = report.items?.filter((i) => i.avance_real === 0).length || 0

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>
        ${getCommonPDFStyles()}
        .progress-bar {
          background: #e0e0e0;
          border-radius: 4px;
          height: 20px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: #4CAF50;
          text-align: center;
          color: white;
          font-size: 11px;
          line-height: 20px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin: 15px 0;
        }
        .stat-box {
          text-align: center;
          padding: 10px;
          border-radius: 6px;
          background: #f5f5f5;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #1565C0;
        }
        .stat-label {
          font-size: 11px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <h1>REPORTE DE ACCIONES INMEDIATAS</h1>

      <h2>1. Información General</h2>
      <table class="info-table">
        ${report.incident?.correlativo ? `<tr><td>Correlativo:</td><td>${report.incident.correlativo}</td></tr>` : ''}
        ${report.incident ? `<tr><td>Incidente:</td><td>${report.incident.descripcion_breve || report.incident.title || '-'}</td></tr>` : ''}
        <tr><td>Fecha Inicio:</td><td>${formatDateShort(report.fecha_inicio)}</td></tr>
        <tr><td>Fecha Término:</td><td>${formatDateShort(report.fecha_termino)}</td></tr>
        <tr><td>Estado:</td><td><span class="badge badge-blue">${getStatusLabel(report.report_status)}</span></td></tr>
      </table>

      <h2>2. Avance General</h2>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${report.porcentaje_avance_plan}%">
          ${formatPercentage(report.porcentaje_avance_plan)}
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${totalItems}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-box" style="background: #E8F5E9;">
          <div class="stat-value" style="color: #2E7D32;">${completedItems}</div>
          <div class="stat-label">Completadas</div>
        </div>
        <div class="stat-box" style="background: #E3F2FD;">
          <div class="stat-value" style="color: #1565C0;">${inProgressItems}</div>
          <div class="stat-label">En Progreso</div>
        </div>
        <div class="stat-box" style="background: #FFF3E0;">
          <div class="stat-value" style="color: #E65100;">${pendingItems}</div>
          <div class="stat-label">Pendientes</div>
        </div>
        <div class="stat-box" style="background: #E3F2FD;">
          <div class="stat-value" style="color: #1565C0;">${formatPercentage(report.porcentaje_avance_plan)}</div>
          <div class="stat-label">Avance</div>
        </div>
      </div>

      ${report.items && report.items.length > 0 ? `
        <h2>3. Detalle de Acciones</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tarea</th>
              <th>Responsable</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Prog.</th>
              <th>Real</th>
            </tr>
          </thead>
          <tbody>
            ${report.items.map((item) => `
              <tr>
                <td>${item.numero}</td>
                <td>${item.tarea || '-'}</td>
                <td>${item.responsable || '-'}</td>
                <td>${formatDateShort(item.inicio)}</td>
                <td>${formatDateShort(item.fin)}</td>
                <td>${formatPercentage(item.avance_programado)}</td>
                <td class="${getItemStatusClass(item.avance_real)}">${formatPercentage(item.avance_real)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      <div class="footer">
        <p>Generado el ${formatDate(new Date())}</p>
      </div>
    </body>
    </html>
  `

  openPrintWindow(html)
}
