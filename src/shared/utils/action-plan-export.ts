/**
 * Action Plan Report Export Utilities
 * Exports Action Plan Reports to Word (DOCX) and PDF formats
 */

import { Document, Packer, Paragraph, Table, TableRow, TextRun, HeadingLevel, WidthType } from 'docx'
import { saveAs } from 'file-saver'
import type { ActionPlanReport, ActionPlanItem } from '@/shared/types/api'
import {
  generateExportFilename,
  formatDate,
  formatDateShort,
  formatPercentage,
  getStatusLabel,
  getActionStatusLabel,
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

function getItemStatusColor(estado: string): string {
  switch (estado?.toLowerCase()) {
    case 'completed':
    case 'completado':
      return 'C8E6C9' // Green
    case 'in_progress':
    case 'en_progreso':
      return 'BBDEFB' // Blue
    case 'delayed':
    case 'retrasado':
      return 'FFCDD2' // Red
    case 'on_hold':
    case 'en_espera':
      return 'FFF9C4' // Yellow
    default:
      return 'F5F5F5' // Gray
  }
}

function getItemStatusClass(estado: string): string {
  switch (estado?.toLowerCase()) {
    case 'completed':
    case 'completado':
      return 'status-completed'
    case 'in_progress':
    case 'en_progreso':
      return 'status-in-progress'
    default:
      return 'status-pending'
  }
}

// ============================================
// WORD EXPORT
// ============================================

export async function exportActionPlanToWord(
  report: ActionPlanReport,
  metadata?: ExportMetadata
): Promise<void> {
  const children: (Paragraph | Table)[] = []

  // Title
  children.push(
    new Paragraph({
      text: 'PLAN DE ACCIÓN',
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

  const infoRows: [string, string][] = []

  if (report.incident?.correlativo) {
    infoRows.push(['Correlativo:', report.incident.correlativo])
  }
  if (report.incident) {
    infoRows.push(['Incidente:', report.incident.descripcion_breve || report.incident.title || '-'])
  }
  infoRows.push(['Fecha Inicio:', formatDateShort(report.fecha_inicio)])
  infoRows.push(['Duración (días):', report.duracion_dias ? String(report.duracion_dias) : '-'])
  infoRows.push(['Fecha Fin Estimada:', formatDateShort(report.fecha_fin_estimada)])
  infoRows.push(['Avance General:', formatPercentage(report.porcentaje_avance_plan)])
  infoRows.push(['Estado:', getStatusLabel(report.report_status)])

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

  // Items del Plan de Acción
  if (report.items && report.items.length > 0) {
    children.push(
      new Paragraph({
        text: '2. Detalle del Plan de Acción',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    const headerRow = new TableRow({
      children: [
        createHeaderCell('#', 4),
        createHeaderCell('Tarea', 22),
        createHeaderCell('Subtarea', 15),
        createHeaderCell('Responsable', 12),
        createHeaderCell('Cliente', 10),
        createHeaderCell('Inicio', 8),
        createHeaderCell('Fin', 8),
        createHeaderCell('Prog.', 6),
        createHeaderCell('Real', 6),
        createHeaderCell('Estado', 9),
      ],
    })

    const dataRows = report.items.map((item: ActionPlanItem) =>
      new TableRow({
        children: [
          createCell(String(item.numero), { alignment: 'center' as const }),
          createCell(item.tarea || '-'),
          createCell(item.subtarea || '-'),
          createCell(item.responsable || '-'),
          createCell(item.cliente || '-'),
          createCell(formatDateShort(item.inicio)),
          createCell(formatDateShort(item.fin)),
          createCell(formatPercentage(item.avance_programado), { alignment: 'center' as const }),
          createCell(formatPercentage(item.avance_real), { alignment: 'center' as const }),
          createCell(getActionStatusLabel(item.estado), {
            alignment: 'center' as const,
            shading: getItemStatusColor(item.estado),
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

  // Resumen
  children.push(
    new Paragraph({
      text: '3. Resumen de Avance',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  const totalItems = report.items?.length || 0
  const completedItems = report.items?.filter((i) => i.estado === 'completed').length || 0
  const inProgressItems = report.items?.filter((i) => i.estado === 'in_progress').length || 0
  const pendingItems = report.items?.filter((i) => i.estado === 'pending').length || 0
  const delayedItems = report.items?.filter((i) => i.estado === 'delayed').length || 0

  const summaryRows: [string, string][] = [
    ['Total de Acciones:', String(totalItems)],
    ['Completadas:', String(completedItems)],
    ['En Progreso:', String(inProgressItems)],
    ['Pendientes:', String(pendingItems)],
    ['Retrasadas:', String(delayedItems)],
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
  const filename = generateExportFilename('Plan de Accion', 'docx', metadata)
  saveAs(blob, filename)
}

// ============================================
// PDF EXPORT
// ============================================

export async function exportActionPlanToPDF(
  report: ActionPlanReport,
  metadata?: ExportMetadata
): Promise<void> {
  const filename = generateExportFilename('Plan de Accion', 'pdf', metadata).replace('.pdf', '')

  const totalItems = report.items?.length || 0
  const completedItems = report.items?.filter((i) => i.estado === 'completed').length || 0
  const inProgressItems = report.items?.filter((i) => i.estado === 'in_progress').length || 0
  const pendingItems = report.items?.filter((i) => i.estado === 'pending').length || 0
  const delayedItems = report.items?.filter((i) => i.estado === 'delayed').length || 0

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
          height: 24px;
          overflow: hidden;
          margin: 10px 0;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #1565C0, #42A5F5);
          text-align: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
          line-height: 24px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          margin: 15px 0;
        }
        .stat-box {
          text-align: center;
          padding: 10px 5px;
          border-radius: 6px;
          background: #f5f5f5;
        }
        .stat-value {
          font-size: 22px;
          font-weight: bold;
          color: #1565C0;
        }
        .stat-label {
          font-size: 10px;
          color: #666;
        }
        .status-completed { color: #2E7D32; font-weight: bold; }
        .status-in-progress { color: #1565C0; }
        .status-pending { color: #F57C00; }
        .status-delayed { color: #C62828; font-weight: bold; }
        td.completed { background: #E8F5E9; }
        td.in_progress { background: #E3F2FD; }
        td.pending { background: #FFF3E0; }
        td.delayed { background: #FFEBEE; }
      </style>
    </head>
    <body>
      <h1>PLAN DE ACCIÓN</h1>

      <h2>1. Información General</h2>
      <table class="info-table">
        ${report.incident?.correlativo ? `<tr><td>Correlativo:</td><td>${report.incident.correlativo}</td></tr>` : ''}
        ${report.incident ? `<tr><td>Incidente:</td><td>${report.incident.descripcion_breve || report.incident.title || '-'}</td></tr>` : ''}
        <tr><td>Fecha Inicio:</td><td>${formatDateShort(report.fecha_inicio)}</td></tr>
        <tr><td>Duración (días):</td><td>${report.duracion_dias || '-'}</td></tr>
        <tr><td>Fecha Fin Estimada:</td><td>${formatDateShort(report.fecha_fin_estimada)}</td></tr>
        <tr><td>Estado:</td><td><span class="badge badge-blue">${getStatusLabel(report.report_status)}</span></td></tr>
      </table>

      <h2>2. Avance General</h2>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${Math.max(report.porcentaje_avance_plan, 5)}%">
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
        <div class="stat-box" style="background: #FFEBEE;">
          <div class="stat-value" style="color: #C62828;">${delayedItems}</div>
          <div class="stat-label">Retrasadas</div>
        </div>
        <div class="stat-box" style="background: #E3F2FD;">
          <div class="stat-value" style="color: #1565C0;">${formatPercentage(report.porcentaje_avance_plan)}</div>
          <div class="stat-label">Avance</div>
        </div>
      </div>

      ${report.items && report.items.length > 0 ? `
        <h2>3. Detalle del Plan</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tarea</th>
              <th>Subtarea</th>
              <th>Responsable</th>
              <th>Cliente</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Prog.</th>
              <th>Real</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${report.items.map((item) => `
              <tr>
                <td>${item.numero}</td>
                <td>${item.tarea || '-'}</td>
                <td>${item.subtarea || '-'}</td>
                <td>${item.responsable || '-'}</td>
                <td>${item.cliente || '-'}</td>
                <td>${formatDateShort(item.inicio)}</td>
                <td>${formatDateShort(item.fin)}</td>
                <td>${formatPercentage(item.avance_programado)}</td>
                <td>${formatPercentage(item.avance_real)}</td>
                <td class="${item.estado} ${getItemStatusClass(item.estado)}">${getActionStatusLabel(item.estado)}</td>
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
