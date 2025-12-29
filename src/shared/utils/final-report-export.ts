/**
 * Final Report Export Utilities
 * Exports Final Reports to Word (DOCX) and PDF formats
 */

import { Document, Packer, Paragraph, Table, TableRow, TextRun, HeadingLevel, WidthType, PageBreak } from 'docx'
import { saveAs } from 'file-saver'
import type {
  FinalReport,
  CausaRaizSummary,
  PersonaInvolucrada,
  EquipoDanado,
  CostoItem,
  ResponsableInvestigacion,
  TerceroIdentificado,
} from '@/shared/types/api'
import {
  generateExportFilename,
  formatDate,
  formatDateShort,
  formatCurrency,
  getStatusLabel,
  createCell,
  createHeaderCell,
  createLabelCell,
  getCommonPDFStyles,
  openPrintWindow,
  type ExportMetadata,
} from './export-helpers'

// Extended metadata for Final Report
export interface FinalReportExportMetadata extends ExportMetadata {
  tipoIncidente?: string
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTipoAccidenteDescription(tipoTabla: FinalReport['tipo_accidente_tabla']): string {
  if (!tipoTabla) return 'No especificado'
  const tipos: string[] = []
  if (tipoTabla.con_baja_il) tipos.push('Con Baja IL')
  if (tipoTabla.sin_baja_il) tipos.push('Sin Baja IL')
  if (tipoTabla.incidente_industrial) tipos.push('Incidente Industrial')
  if (tipoTabla.incidente_laboral) tipos.push('Incidente Laboral')
  if (tipoTabla.es_plgf && tipoTabla.nivel_plgf) tipos.push(`PLGF ${tipoTabla.nivel_plgf}`)
  return tipos.length > 0 ? tipos.join(', ') : 'No especificado'
}

function getMetodologiaLabel(metodologia: string | undefined): string {
  if (!metodologia) return '-'
  const labels: Record<string, string> = {
    '5_whys': '5 Porqués',
    'five_whys': '5 Porqués',
    'fishbone': 'Diagrama Ishikawa',
    'ishikawa': 'Diagrama Ishikawa',
    'causal_tree': 'Árbol Causal',
    'other': 'Otro',
  }
  return labels[metodologia.toLowerCase()] || metodologia
}

// ============================================
// WORD EXPORT
// ============================================

export async function exportFinalReportToWord(
  report: FinalReport,
  metadata?: FinalReportExportMetadata
): Promise<void> {
  const children: (Paragraph | Table)[] = []

  // Title
  children.push(
    new Paragraph({
      text: 'INFORME FINAL DE INVESTIGACIÓN DE INCIDENTE',
      heading: HeadingLevel.HEADING_1,
      alignment: 'center' as const,
      spacing: { after: 400 },
    })
  )

  // 1. Company Info
  children.push(
    new Paragraph({
      text: '1. Información de la Empresa',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  const companyRows: [string, string][] = [
    ['Empresa:', report.company_data?.nombre || '-'],
    ['RUT:', report.company_data?.rut || '-'],
    ['Dirección:', report.company_data?.direccion || '-'],
    ['Teléfono:', report.company_data?.telefono || '-'],
    ['Email:', report.company_data?.email || '-'],
  ]

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: companyRows.map(([label, value]) =>
        new TableRow({
          children: [
            createLabelCell(label, 25),
            createCell(value, { width: 75 }),
          ],
        })
      ),
    })
  )

  // 2. Accident Type
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
        new TextRun({ text: 'Tipo: ', bold: true }),
        new TextRun({ text: getTipoAccidenteDescription(report.tipo_accidente_tabla) }),
      ],
      spacing: { after: 200 },
    })
  )

  // 3. Accident Details
  children.push(
    new Paragraph({
      text: '3. Descripción del Incidente',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 300, after: 200 },
    })
  )

  if (report.detalles_accidente) {
    children.push(
      new Paragraph({
        text: report.detalles_accidente,
        spacing: { after: 200 },
      })
    )
  }

  if (report.descripcion_detallada) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: 'Descripción Detallada:', bold: true })],
        spacing: { before: 100, after: 100 },
      })
    )
    children.push(
      new Paragraph({
        text: report.descripcion_detallada,
        spacing: { after: 200 },
      })
    )
  }

  // 4. Personas Involucradas
  if (report.personas_involucradas && report.personas_involucradas.length > 0) {
    children.push(
      new Paragraph({
        text: '4. Personas Involucradas',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    const personasHeaderRow = new TableRow({
      children: [
        createHeaderCell('#', 8),
        createHeaderCell('Nombre', 25),
        createHeaderCell('Cargo', 20),
        createHeaderCell('Empresa', 20),
        createHeaderCell('Tipo Lesión', 27),
      ],
    })

    const personasDataRows = report.personas_involucradas.map((persona: PersonaInvolucrada, idx: number) =>
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
        rows: [personasHeaderRow, ...personasDataRows],
      })
    )
  }

  // 5. Equipos Dañados
  if (report.equipos_danados && report.equipos_danados.length > 0) {
    children.push(
      new Paragraph({
        text: '5. Equipos Dañados',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    const equiposHeaderRow = new TableRow({
      children: [
        createHeaderCell('#', 8),
        createHeaderCell('Equipo', 35),
        createHeaderCell('Descripción', 35),
        createHeaderCell('Costo Estimado', 22),
      ],
    })

    const equiposDataRows = report.equipos_danados.map((equipo: EquipoDanado, idx: number) =>
      new TableRow({
        children: [
          createCell(String(idx + 1), { alignment: 'center' as const }),
          createCell(equipo.nombre || '-'),
          createCell(equipo.descripcion || '-'),
          createCell(formatCurrency(equipo.costo_estimado), { alignment: 'right' as const }),
        ],
      })
    )

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [equiposHeaderRow, ...equiposDataRows],
      })
    )
  }

  // 6. Terceros Identificados
  if (report.terceros_identificados && report.terceros_identificados.length > 0) {
    children.push(
      new Paragraph({
        text: '6. Terceros Identificados',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    const tercerosHeaderRow = new TableRow({
      children: [
        createHeaderCell('#', 10),
        createHeaderCell('Nombre', 35),
        createHeaderCell('Empresa', 30),
        createHeaderCell('Rol', 25),
      ],
    })

    const tercerosDataRows = report.terceros_identificados.map((tercero: TerceroIdentificado, idx: number) =>
      new TableRow({
        children: [
          createCell(String(idx + 1), { alignment: 'center' as const }),
          createCell(tercero.nombre || '-'),
          createCell(tercero.empresa || '-'),
          createCell(tercero.rol || '-'),
        ],
      })
    )

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [tercerosHeaderRow, ...tercerosDataRows],
      })
    )
  }

  // Page break before causas raíz
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  )

  // 7. Análisis de Causas Raíz
  if (report.analisis_causas_raiz && report.analisis_causas_raiz.length > 0) {
    children.push(
      new Paragraph({
        text: '7. Análisis de Causas Raíz',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    const causasHeaderRow = new TableRow({
      children: [
        createHeaderCell('#', 5),
        createHeaderCell('Problema', 25),
        createHeaderCell('Causa Raíz', 28),
        createHeaderCell('Acción Correctiva', 27),
        createHeaderCell('Metodología', 15),
      ],
    })

    const causasDataRows = report.analisis_causas_raiz.map((causa: CausaRaizSummary, idx: number) =>
      new TableRow({
        children: [
          createCell(String(idx + 1), { alignment: 'center' as const }),
          createCell(causa.problema || '-'),
          createCell(causa.causa_raiz || '-'),
          createCell(causa.accion_plan || '-'),
          createCell(getMetodologiaLabel(causa.metodologia)),
        ],
      })
    )

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [causasHeaderRow, ...causasDataRows],
      })
    )
  }

  // 8. Acciones Inmediatas
  if (report.acciones_inmediatas_resumen) {
    children.push(
      new Paragraph({
        text: '8. Acciones Inmediatas',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    children.push(
      new Paragraph({
        text: report.acciones_inmediatas_resumen,
        spacing: { after: 200 },
        shading: { fill: 'FFF3E0' },
      })
    )
  }

  // 9. Plan de Acción
  if (report.plan_accion_resumen) {
    children.push(
      new Paragraph({
        text: '9. Plan de Acción',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    children.push(
      new Paragraph({
        text: report.plan_accion_resumen,
        spacing: { after: 200 },
        shading: { fill: 'E3F2FD' },
      })
    )
  }

  // 10. Costos
  if (report.costos_tabla && report.costos_tabla.length > 0) {
    children.push(
      new Paragraph({
        text: '10. Costos Estimados',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    const costosHeaderRow = new TableRow({
      children: [
        createHeaderCell('#', 8),
        createHeaderCell('Concepto', 50),
        createHeaderCell('Monto', 22),
        createHeaderCell('Moneda', 20),
      ],
    })

    const costosDataRows = report.costos_tabla.map((costo: CostoItem, idx: number) =>
      new TableRow({
        children: [
          createCell(String(idx + 1), { alignment: 'center' as const }),
          createCell(costo.concepto || '-'),
          createCell(formatCurrency(costo.monto), { alignment: 'right' as const }),
          createCell(costo.moneda || '-'),
        ],
      })
    )

    // Total row
    const totalMonto = report.costos_tabla.reduce((sum, c) => sum + (c.monto || 0), 0)
    const totalRow = new TableRow({
      children: [
        createCell('', { shading: 'E8F5E9' }),
        createCell('TOTAL', { bold: true, shading: 'E8F5E9' }),
        createCell(formatCurrency(totalMonto), { bold: true, alignment: 'right' as const, shading: 'E8F5E9' }),
        createCell('', { shading: 'E8F5E9' }),
      ],
    })

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [costosHeaderRow, ...costosDataRows, totalRow],
      })
    )
  }

  // 11. Conclusiones
  if (report.conclusiones) {
    children.push(
      new Paragraph({
        text: '11. Conclusiones',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    children.push(
      new Paragraph({
        text: report.conclusiones,
        spacing: { after: 200 },
        shading: { fill: 'E8F5E9' },
      })
    )
  }

  // 12. Lecciones Aprendidas
  if (report.lecciones_aprendidas) {
    children.push(
      new Paragraph({
        text: '12. Lecciones Aprendidas',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    children.push(
      new Paragraph({
        text: report.lecciones_aprendidas,
        spacing: { after: 200 },
        shading: { fill: 'FCE4EC' },
      })
    )
  }

  // 13. Responsables de Investigación
  if (report.responsables_investigacion && report.responsables_investigacion.length > 0) {
    children.push(
      new Paragraph({
        text: '13. Responsables de la Investigación',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    )

    const respHeaderRow = new TableRow({
      children: [
        createHeaderCell('#', 10),
        createHeaderCell('Nombre', 45),
        createHeaderCell('Cargo', 45),
      ],
    })

    const respDataRows = report.responsables_investigacion.map((resp: ResponsableInvestigacion, idx: number) =>
      new TableRow({
        children: [
          createCell(String(idx + 1), { alignment: 'center' as const }),
          createCell(resp.nombre || '-'),
          createCell(resp.cargo || '-'),
        ],
      })
    )

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [respHeaderRow, ...respDataRows],
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
  const filename = generateExportFilename('Informe Final', 'docx', metadata)
  saveAs(blob, filename)
}

// ============================================
// PDF EXPORT
// ============================================

export async function exportFinalReportToPDF(
  report: FinalReport,
  metadata?: FinalReportExportMetadata
): Promise<void> {
  const filename = generateExportFilename('Informe Final', 'pdf', metadata).replace('.pdf', '')
  const totalCostos = report.costos_tabla?.reduce((sum, c) => sum + (c.monto || 0), 0) || 0

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${filename}</title>
      <style>${getCommonPDFStyles()}</style>
    </head>
    <body>
      <h1>INFORME FINAL DE INVESTIGACIÓN DE INCIDENTE</h1>

      <h2>1. Información de la Empresa</h2>
      <table class="info-table">
        <tr><td>Empresa:</td><td>${report.company_data?.nombre || '-'}</td></tr>
        <tr><td>RUT:</td><td>${report.company_data?.rut || '-'}</td></tr>
        <tr><td>Dirección:</td><td>${report.company_data?.direccion || '-'}</td></tr>
        <tr><td>Teléfono:</td><td>${report.company_data?.telefono || '-'}</td></tr>
        <tr><td>Email:</td><td>${report.company_data?.email || '-'}</td></tr>
      </table>

      <h2>2. Clasificación del Incidente</h2>
      <p><strong>Tipo:</strong> ${getTipoAccidenteDescription(report.tipo_accidente_tabla)}</p>

      <h2>3. Descripción del Incidente</h2>
      ${report.detalles_accidente ? `<p>${report.detalles_accidente}</p>` : ''}
      ${report.descripcion_detallada ? `
        <p><strong>Descripción Detallada:</strong></p>
        <p>${report.descripcion_detallada}</p>
      ` : ''}

      ${report.personas_involucradas && report.personas_involucradas.length > 0 ? `
        <h2>4. Personas Involucradas</h2>
        <table>
          <thead>
            <tr><th>#</th><th>Nombre</th><th>Cargo</th><th>Empresa</th><th>Tipo Lesión</th></tr>
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

      ${report.equipos_danados && report.equipos_danados.length > 0 ? `
        <h2>5. Equipos Dañados</h2>
        <table>
          <thead>
            <tr><th>#</th><th>Equipo</th><th>Descripción</th><th>Costo Estimado</th></tr>
          </thead>
          <tbody>
            ${report.equipos_danados.map((e, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${e.nombre || '-'}</td>
                <td>${e.descripcion || '-'}</td>
                <td style="text-align: right;">${formatCurrency(e.costo_estimado)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${report.terceros_identificados && report.terceros_identificados.length > 0 ? `
        <h2>6. Terceros Identificados</h2>
        <table>
          <thead>
            <tr><th>#</th><th>Nombre</th><th>Empresa</th><th>Rol</th></tr>
          </thead>
          <tbody>
            ${report.terceros_identificados.map((t, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${t.nombre || '-'}</td>
                <td>${t.empresa || '-'}</td>
                <td>${t.rol || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${report.analisis_causas_raiz && report.analisis_causas_raiz.length > 0 ? `
        <div class="page-break"></div>
        <h2>7. Análisis de Causas Raíz</h2>
        <table>
          <thead>
            <tr><th>#</th><th>Problema</th><th>Causa Raíz</th><th>Acción Correctiva</th><th>Metodología</th></tr>
          </thead>
          <tbody>
            ${report.analisis_causas_raiz.map((c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${c.problema || '-'}</td>
                <td>${c.causa_raiz || '-'}</td>
                <td>${c.accion_plan || '-'}</td>
                <td>${getMetodologiaLabel(c.metodologia)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}

      ${report.acciones_inmediatas_resumen ? `
        <h2>8. Acciones Inmediatas</h2>
        <div class="highlight-box highlight-orange">${report.acciones_inmediatas_resumen}</div>
      ` : ''}

      ${report.plan_accion_resumen ? `
        <h2>9. Plan de Acción</h2>
        <div class="highlight-box highlight-blue">${report.plan_accion_resumen}</div>
      ` : ''}

      ${report.costos_tabla && report.costos_tabla.length > 0 ? `
        <h2>10. Costos Estimados</h2>
        <table>
          <thead>
            <tr><th>#</th><th>Concepto</th><th>Monto</th><th>Moneda</th></tr>
          </thead>
          <tbody>
            ${report.costos_tabla.map((c, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${c.concepto || '-'}</td>
                <td style="text-align: right;">${formatCurrency(c.monto)}</td>
                <td>${c.moneda || '-'}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td></td>
              <td><strong>TOTAL</strong></td>
              <td style="text-align: right;"><strong>${formatCurrency(totalCostos)}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      ` : ''}

      ${report.conclusiones ? `
        <h2>11. Conclusiones</h2>
        <div class="highlight-box highlight-green">${report.conclusiones}</div>
      ` : ''}

      ${report.lecciones_aprendidas ? `
        <h2>12. Lecciones Aprendidas</h2>
        <div class="highlight-box highlight-pink">${report.lecciones_aprendidas}</div>
      ` : ''}

      ${report.responsables_investigacion && report.responsables_investigacion.length > 0 ? `
        <h2>13. Responsables de la Investigación</h2>
        <table>
          <thead>
            <tr><th>#</th><th>Nombre</th><th>Cargo</th></tr>
          </thead>
          <tbody>
            ${report.responsables_investigacion.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${r.nombre || '-'}</td>
                <td>${r.cargo || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
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
