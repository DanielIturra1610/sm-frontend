/**
 * Flash Report Export Utilities
 * Exports Flash Reports to Word (DOCX) and PDF formats
 */

import { Document, Packer, Paragraph, Table, TableRow, TextRun, HeadingLevel, WidthType } from 'docx'
import { saveAs } from 'file-saver'
import type { FlashReport, PersonaInvolucrada } from '@/shared/types/api'
import {
  generateExportFilename,
  formatDate,
  formatDateShort,
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

function getTipoSucesoLabel(tipo: string | undefined): string {
  if (!tipo) return '-'
  const labels: Record<string, string> = {
    del_trabajo_con_baja: 'Del trabajo con baja',
    del_trabajo_sin_baja: 'Del trabajo sin baja',
    in_itinere: 'In Itinere',
    incidente_industrial: 'Incidente Industrial',
    incidente_laboral: 'Incidente Laboral',
  }
  return labels[tipo] || tipo
}

function getClasificacionIncidente(report: FlashReport): string {
  const tipos: string[] = []
  if (report.con_baja_il) tipos.push('Con Baja IL')
  if (report.sin_baja_il) tipos.push('Sin Baja IL')
  if (report.incidente_industrial) tipos.push('Incidente Industrial')
  if (report.incidente_laboral) tipos.push('Incidente Laboral')
  if (report.es_plgf && report.nivel_plgf) tipos.push(`PLGF ${report.nivel_plgf}`)
  return tipos.length > 0 ? tipos.join(', ') : 'No especificado'
}

// ============================================
// WORD EXPORT
// ============================================

export async function exportFlashReportToWord(
  report: FlashReport,
  metadata?: ExportMetadata
): Promise<void> {
  const children: (Paragraph | Table)[] = []

  // Title
  children.push(
    new Paragraph({
      text: 'FLASH REPORT',
      heading: HeadingLevel.HEADING_1,
      alignment: 'center' as const,
      spacing: { after: 400 },
    })
  )

  // Información General
  children.push(
    new Paragraph({
      text: '1. Información del Suceso',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  const infoRows = [
    ['Suceso:', report.suceso || '-'],
    ['Tipo:', getTipoSucesoLabel(report.tipo)],
    ['Fecha:', formatDateShort(report.fecha)],
    ['Hora:', report.hora || '-'],
    ['Lugar:', report.lugar || '-'],
    ['Área/Zona:', report.area_zona || '-'],
    ['Empresa:', report.empresa || '-'],
    ['Supervisor:', report.supervisor || '-'],
    ['N° Prodity:', report.numero_prodity || '-'],
    ['Zonal:', report.zonal || '-'],
  ]

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

  // Clasificación
  children.push(
    new Paragraph({
      text: '2. Clasificación del Incidente',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Clasificación: ', bold: true }),
        new TextRun({ text: getClasificacionIncidente(report) }),
      ],
      spacing: { after: 100 },
    })
  )

  if (report.es_plgf && report.justificacion_plgf) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Justificación PLGF: ', bold: true }),
          new TextRun({ text: report.justificacion_plgf }),
        ],
        spacing: { after: 200 },
      })
    )
  }

  // Descripción
  children.push(
    new Paragraph({
      text: '3. Descripción del Suceso',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  children.push(
    new Paragraph({
      text: report.descripcion || 'Sin descripción',
      spacing: { after: 200 },
    })
  )

  // Personas Involucradas
  if (report.personas_involucradas && report.personas_involucradas.length > 0) {
    children.push(
      new Paragraph({
        text: '4. Personas Involucradas',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    const headerRow = new TableRow({
      children: [
        createHeaderCell('#', 8),
        createHeaderCell('Nombre', 25),
        createHeaderCell('Cargo', 20),
        createHeaderCell('Empresa', 20),
        createHeaderCell('Tipo Lesión', 27),
      ],
    })

    const dataRows = report.personas_involucradas.map((persona: PersonaInvolucrada, idx: number) =>
      new TableRow({
        children: [
          createCell(String(idx + 1), { alignment: 'center' as const }),
          createCell(persona.nombre || '-'),
          createCell(persona.cargo || '-'),
          createCell(persona.empresa || '-'),
          createCell(persona.tipo_lesion || '-'),
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

  // Acciones Inmediatas
  if (report.acciones_inmediatas) {
    children.push(
      new Paragraph({
        text: '5. Acciones Inmediatas',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    children.push(
      new Paragraph({
        text: report.acciones_inmediatas,
        spacing: { after: 200 },
        shading: { fill: 'FFF3E0' },
      })
    )
  }

  // Controles Inmediatos
  if (report.controles_inmediatos) {
    children.push(
      new Paragraph({
        text: '6. Controles Inmediatos',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    children.push(
      new Paragraph({
        text: report.controles_inmediatos,
        spacing: { after: 200 },
        shading: { fill: 'E3F2FD' },
      })
    )
  }

  // Factores de Riesgo
  if (report.factores_riesgo) {
    children.push(
      new Paragraph({
        text: '7. Factores de Riesgo',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    children.push(
      new Paragraph({
        text: report.factores_riesgo,
        spacing: { after: 200 },
        shading: { fill: 'FFEBEE' },
      })
    )
  }

  // Footer
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Estado: ${getStatusLabel(report.report_status)}`, size: 20 }),
      ],
      spacing: { before: 400 },
    })
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: `Generado el ${formatDate(new Date())}`, size: 20, italics: true }),
      ],
      alignment: 'right' as const,
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
  const filename = generateExportFilename('Flash Report', 'docx', metadata)
  saveAs(blob, filename)
}

// ============================================
// PDF EXPORT
// ============================================

export async function exportFlashReportToPDF(
  report: FlashReport,
  metadata?: ExportMetadata
): Promise<void> {
  const filename = generateExportFilename('Flash Report', 'pdf', metadata).replace('.pdf', '')

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>${getCommonPDFStyles()}</style>
    </head>
    <body>
      <h1>FLASH REPORT</h1>

      <h2>1. Información del Suceso</h2>
      <table class="info-table">
        <tr><td>Suceso:</td><td>${report.suceso || '-'}</td></tr>
        <tr><td>Tipo:</td><td>${getTipoSucesoLabel(report.tipo)}</td></tr>
        <tr><td>Fecha:</td><td>${formatDateShort(report.fecha)}</td></tr>
        <tr><td>Hora:</td><td>${report.hora || '-'}</td></tr>
        <tr><td>Lugar:</td><td>${report.lugar || '-'}</td></tr>
        <tr><td>Área/Zona:</td><td>${report.area_zona || '-'}</td></tr>
        <tr><td>Empresa:</td><td>${report.empresa || '-'}</td></tr>
        <tr><td>Supervisor:</td><td>${report.supervisor || '-'}</td></tr>
        <tr><td>N° Prodity:</td><td>${report.numero_prodity || '-'}</td></tr>
        <tr><td>Zonal:</td><td>${report.zonal || '-'}</td></tr>
      </table>

      <h2>2. Clasificación del Incidente</h2>
      <p><strong>Clasificación:</strong> ${getClasificacionIncidente(report)}</p>
      ${report.es_plgf && report.justificacion_plgf ? `
        <p><strong>Justificación PLGF:</strong> ${report.justificacion_plgf}</p>
      ` : ''}

      <h2>3. Descripción del Suceso</h2>
      <div class="highlight-box highlight-blue">
        <p>${report.descripcion || 'Sin descripción'}</p>
      </div>

      ${report.personas_involucradas && report.personas_involucradas.length > 0 ? `
        <h2>4. Personas Involucradas</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Empresa</th>
              <th>Tipo Lesión</th>
            </tr>
          </thead>
          <tbody>
            ${report.personas_involucradas.map((p, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${p.nombre || '-'}</td>
                <td>${p.cargo || '-'}</td>
                <td>${p.empresa || '-'}</td>
                <td>${p.tipo_lesion || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${report.acciones_inmediatas ? `
        <h2>5. Acciones Inmediatas</h2>
        <div class="highlight-box highlight-orange">
          <p>${report.acciones_inmediatas}</p>
        </div>
      ` : ''}

      ${report.controles_inmediatos ? `
        <h2>6. Controles Inmediatos</h2>
        <div class="highlight-box highlight-blue">
          <p>${report.controles_inmediatos}</p>
        </div>
      ` : ''}

      ${report.factores_riesgo ? `
        <h2>7. Factores de Riesgo</h2>
        <div class="highlight-box highlight-red">
          <p>${report.factores_riesgo}</p>
        </div>
      ` : ''}

      <div class="footer">
        <span class="badge badge-blue">${getStatusLabel(report.report_status)}</span>
        <p>Generado el ${formatDate(new Date())}</p>
      </div>
    </body>
    </html>
  `

  openPrintWindow(html)
}
