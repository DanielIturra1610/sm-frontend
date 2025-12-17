import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, WidthType, BorderStyle, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import type { FiveWhysAnalysis, WhyEntry, FiveWhysActionItem } from '@/shared/types/api'

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
  }
  return labels[status] || status
}

// Helper to get priority label
function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
  }
  return labels[priority] || priority
}

// Helper to get action status label
function getActionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    completed: 'Completada',
  }
  return labels[status] || status
}

// ============================================
// EXCEL EXPORT
// ============================================
export async function exportToExcel(analysis: FiveWhysAnalysis): Promise<void> {
  const workbook = XLSX.utils.book_new()

  // ========== Sheet 1: Análisis de 5 Porqués ==========
  const mainData: (string | number)[][] = []

  // Header
  mainData.push(['ANÁLISIS DE 5 PORQUÉS'])
  mainData.push([])
  mainData.push(['Título:', analysis.title])
  mainData.push(['ID del Análisis:', analysis.id])
  mainData.push(['Incidente:', analysis.incidentId])
  mainData.push(['Estado:', getStatusLabel(analysis.status)])
  mainData.push(['Fecha de Creación:', formatDate(analysis.createdAt)])
  mainData.push(['Creado Por:', analysis.createdBy])
  if (analysis.reviewedBy) {
    mainData.push(['Revisado Por:', analysis.reviewedBy])
    mainData.push(['Fecha de Revisión:', analysis.reviewedAt ? formatDate(analysis.reviewedAt) : '-'])
  }
  mainData.push([])

  // Problem Statement
  mainData.push(['DECLARACIÓN DEL PROBLEMA'])
  mainData.push([analysis.problemStatement])
  mainData.push([])

  // The 5 Whys
  mainData.push(['CADENA DE ANÁLISIS - LOS 5 PORQUÉS'])
  mainData.push(['#', 'Pregunta', 'Respuesta', 'Evidencia', 'Es Causa Raíz'])

  const sortedWhys = [...(analysis.whys || [])].sort((a, b) => a.whyNumber - b.whyNumber)
  sortedWhys.forEach((why) => {
    const evidence = why.evidence?.join('; ') || '-'
    mainData.push([
      why.whyNumber,
      why.question,
      why.answer,
      evidence,
      why.isRootCause ? 'Sí' : 'No',
    ])
  })

  mainData.push([])

  // Root Cause
  mainData.push(['CAUSA RAÍZ IDENTIFICADA'])
  mainData.push([analysis.rootCause || 'Pendiente de identificar'])
  if (analysis.rootCauseCategory) {
    mainData.push(['Categoría:', analysis.rootCauseCategory.replace(/_/g, ' ')])
  }
  mainData.push([])

  // Action Items
  if (analysis.actionItems && analysis.actionItems.length > 0) {
    mainData.push(['ACCIONES CORRECTIVAS Y PREVENTIVAS'])
    mainData.push(['#', 'Descripción', 'Tipo', 'Responsable', 'Fecha Límite', 'Prioridad', 'Estado'])

    analysis.actionItems.forEach((item, index) => {
      mainData.push([
        index + 1,
        item.description,
        item.actionType === 'corrective' ? 'Correctiva' : 'Preventiva',
        item.assignedTo || '-',
        item.dueDate ? formatDate(item.dueDate) : '-',
        getPriorityLabel(item.priority),
        getActionStatusLabel(item.status),
      ])
    })
  }

  const mainSheet = XLSX.utils.aoa_to_sheet(mainData)

  // Set column widths
  mainSheet['!cols'] = [
    { wch: 5 },   // #
    { wch: 40 },  // Pregunta/Descripción
    { wch: 40 },  // Respuesta
    { wch: 30 },  // Evidencia/Fecha
    { wch: 12 },  // Prioridad
    { wch: 15 },  // Estado
  ]

  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Análisis 5 Porqués')

  // Generate and save file
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `analisis-5-porques-${analysis.id.slice(0, 8)}.xlsx`)
}

// ============================================
// WORD EXPORT
// ============================================
export async function exportToWord(analysis: FiveWhysAnalysis): Promise<void> {
  const children: (Paragraph | Table)[] = []

  // Title
  children.push(
    new Paragraph({
      text: 'ANÁLISIS DE 5 PORQUÉS',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  )

  // Metadata section
  children.push(
    new Paragraph({
      text: 'Información General',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  )

  // Info table
  const infoRows = [
    ['Título:', analysis.title],
    ['ID del Análisis:', analysis.id],
    ['Incidente:', analysis.incidentId],
    ['Estado:', getStatusLabel(analysis.status)],
    ['Fecha de Creación:', formatDate(analysis.createdAt)],
    ['Creado Por:', analysis.createdBy],
  ]

  if (analysis.reviewedBy) {
    infoRows.push(['Revisado Por:', analysis.reviewedBy])
    infoRows.push(['Fecha de Revisión:', analysis.reviewedAt ? formatDate(analysis.reviewedAt) : '-'])
  }

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

  // Problem Statement
  children.push(
    new Paragraph({
      text: 'Declaración del Problema',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: analysis.problemStatement,
          size: 24,
        }),
      ],
      spacing: { after: 200 },
      shading: { fill: 'E3F2FD' },
    })
  )

  // The 5 Whys
  children.push(
    new Paragraph({
      text: 'Cadena de Análisis - Los 5 Porqués',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  )

  // Create whys table
  const whysHeaderRow = new TableRow({
    children: ['#', 'Pregunta', 'Respuesta', 'Evidencia', 'Causa Raíz'].map(text =>
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

  const sortedWhysForWord = [...(analysis.whys || [])].sort((a, b) => a.whyNumber - b.whyNumber)
  const whysDataRows = sortedWhysForWord.map((why) =>
    new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: String(why.whyNumber), alignment: AlignmentType.CENTER })],
          width: { size: 5, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        }),
        new TableCell({
          children: [new Paragraph({ text: why.question })],
          width: { size: 28, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        }),
        new TableCell({
          children: [new Paragraph({ text: why.answer })],
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        }),
        new TableCell({
          children: [new Paragraph({ text: why.evidence?.join('\n') || '-' })],
          width: { size: 25, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        }),
        new TableCell({
          children: [new Paragraph({ text: why.isRootCause ? 'Sí' : 'No', alignment: AlignmentType.CENTER })],
          width: { size: 12, type: WidthType.PERCENTAGE },
          shading: why.isRootCause ? { fill: 'C8E6C9' } : undefined,
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
      rows: [whysHeaderRow, ...whysDataRows],
    })
  )

  // Root Cause
  children.push(
    new Paragraph({
      text: analysis.rootCause ? 'Causa Raíz Identificada' : 'Causa Raíz Pendiente',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  )

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: analysis.rootCause || 'La causa raíz aún no ha sido identificada.',
          size: 24,
          bold: !!analysis.rootCause,
          italics: !analysis.rootCause,
        }),
      ],
      spacing: { after: 200 },
      shading: { fill: analysis.rootCause ? 'E8F5E9' : 'FFF3E0' },
    })
  )

  if (analysis.rootCauseCategory) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Categoría: ${analysis.rootCauseCategory.replace(/_/g, ' ')}`,
            size: 20,
          }),
        ],
        spacing: { after: 200 },
      })
    )
  }

  // Action Items
  if (analysis.actionItems && analysis.actionItems.length > 0) {
    children.push(
      new Paragraph({
        text: 'Acciones Correctivas y Preventivas',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    )

    const actionsHeaderRow = new TableRow({
      children: ['#', 'Descripción', 'Tipo', 'Responsable', 'Fecha Límite', 'Prioridad', 'Estado'].map(text =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
          shading: { fill: 'FF9800' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1 },
            bottom: { style: BorderStyle.SINGLE, size: 1 },
            left: { style: BorderStyle.SINGLE, size: 1 },
            right: { style: BorderStyle.SINGLE, size: 1 },
          },
        })
      ),
    })

    const actionsDataRows = analysis.actionItems.map((item, index) =>
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: String(index + 1), alignment: AlignmentType.CENTER })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          new TableCell({
            children: [new Paragraph({ text: item.description })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          new TableCell({
            children: [new Paragraph({ text: item.actionType === 'corrective' ? 'Correctiva' : 'Preventiva' })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          new TableCell({
            children: [new Paragraph({ text: item.assignedTo || '-' })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          new TableCell({
            children: [new Paragraph({ text: item.dueDate ? formatDate(item.dueDate) : '-' })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          new TableCell({
            children: [new Paragraph({ text: getPriorityLabel(item.priority) })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
            },
          }),
          new TableCell({
            children: [new Paragraph({ text: getActionStatusLabel(item.status) })],
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
        rows: [actionsHeaderRow, ...actionsDataRows],
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
  saveAs(blob, `analisis-5-porques-${analysis.id.slice(0, 8)}.docx`)
}

// ============================================
// PDF EXPORT (via HTML print)
// ============================================
export async function exportToPDF(analysis: FiveWhysAnalysis): Promise<void> {
  // Build HTML content
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Análisis de 5 Porqués - ${analysis.id.slice(0, 8)}</title>
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
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 14px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px 10px;
          text-align: left;
        }
        th {
          background: #1976D2;
          color: white;
          font-weight: 600;
        }
        tr:nth-child(even) { background: #f9f9f9; }
        .problem-box {
          background: #E3F2FD;
          border: 2px solid #1976D2;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
        }
        .root-cause-box {
          background: #E8F5E9;
          border: 2px solid #4CAF50;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
        }
        .root-cause-box p {
          font-weight: bold;
          color: #2E7D32;
          font-size: 16px;
        }
        .info-table td:first-child {
          font-weight: bold;
          background: #f5f5f5;
          width: 30%;
        }
        .why-number {
          background: #1976D2;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          margin-right: 10px;
        }
        .why-card {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          margin: 15px 0;
          overflow: hidden;
        }
        .why-header {
          background: #f5f5f5;
          padding: 12px 15px;
          font-weight: bold;
          border-bottom: 1px solid #e0e0e0;
        }
        .why-content {
          padding: 15px;
        }
        .why-question {
          color: #666;
          margin-bottom: 8px;
        }
        .why-answer {
          font-weight: 500;
          color: #333;
        }
        .why-evidence {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed #ddd;
          font-size: 13px;
          color: #666;
        }
        .arrow-down {
          text-align: center;
          font-size: 24px;
          color: #1976D2;
          margin: 5px 0;
        }
        .actions-header th {
          background: #FF9800;
        }
        .priority-high { color: #D32F2F; font-weight: bold; }
        .priority-medium { color: #F57C00; }
        .priority-low { color: #388E3C; }
        .status-completed { color: #388E3C; }
        .status-in_progress { color: #1976D2; }
        .status-pending { color: #757575; }
        .footer {
          margin-top: 40px;
          text-align: right;
          color: #666;
          font-size: 12px;
          font-style: italic;
        }
        @media print {
          body { padding: 20px; }
          .why-card { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>ANÁLISIS DE 5 PORQUÉS</h1>

      <h2>Información General</h2>
      <table class="info-table">
        <tr><td>Título:</td><td>${analysis.title}</td></tr>
        <tr><td>ID del Análisis:</td><td>${analysis.id}</td></tr>
        <tr><td>Incidente:</td><td>${analysis.incidentId}</td></tr>
        <tr><td>Estado:</td><td>${getStatusLabel(analysis.status)}</td></tr>
        <tr><td>Fecha de Creación:</td><td>${formatDate(analysis.createdAt)}</td></tr>
        <tr><td>Creado Por:</td><td>${analysis.createdBy}</td></tr>
        ${analysis.reviewedBy ? `
          <tr><td>Revisado Por:</td><td>${analysis.reviewedBy}</td></tr>
          <tr><td>Fecha de Revisión:</td><td>${analysis.reviewedAt ? formatDate(analysis.reviewedAt) : '-'}</td></tr>
        ` : ''}
      </table>

      <h2>Declaración del Problema</h2>
      <div class="problem-box">
        <p>${analysis.problemStatement}</p>
      </div>

      <h2>Cadena de Análisis - Los 5 Porqués</h2>
      ${(analysis.whys || []).length > 0 ? [...analysis.whys].sort((a, b) => a.whyNumber - b.whyNumber).map((why, index, arr) => `
        <div class="why-card" style="${why.isRootCause ? 'border-color: #4CAF50; background: #E8F5E9;' : ''}">
          <div class="why-header" style="${why.isRootCause ? 'background: #4CAF50; color: white;' : ''}">
            <span class="why-number" style="${why.isRootCause ? 'background: #2E7D32;' : ''}">${why.whyNumber}</span>
            Por qué #${why.whyNumber}
            ${why.isRootCause ? '<span style="margin-left: 10px; background: #2E7D32; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">CAUSA RAÍZ</span>' : ''}
          </div>
          <div class="why-content">
            <div class="why-question"><strong>Pregunta:</strong> ${why.question}</div>
            <div class="why-answer"><strong>Respuesta:</strong> ${why.answer}</div>
            ${why.evidence && why.evidence.length > 0 ? `
              <div class="why-evidence">
                <strong>Evidencia:</strong>
                <ul>
                  ${why.evidence.map(e => `<li>${e}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
            ${why.notes ? `<div class="why-evidence"><strong>Notas:</strong> ${why.notes}</div>` : ''}
          </div>
        </div>
        ${index < arr.length - 1 ? '<div class="arrow-down">↓</div>' : ''}
      `).join('') : '<p style="color: #666; font-style: italic;">No se han agregado preguntas "¿Por qué?" aún.</p>'}

      <h2>${analysis.rootCause ? 'Causa Raíz Identificada' : 'Causa Raíz Pendiente'}</h2>
      <div class="root-cause-box" style="${!analysis.rootCause ? 'background: #FFF3E0; border-color: #FF9800;' : ''}">
        <p style="${!analysis.rootCause ? 'color: #E65100; font-style: italic; font-weight: normal;' : ''}">${analysis.rootCause || 'La causa raíz aún no ha sido identificada.'}</p>
        ${analysis.rootCauseCategory ? `<p style="font-size: 14px; color: #666; font-weight: normal;">Categoría: ${analysis.rootCauseCategory.replace(/_/g, ' ')}</p>` : ''}
      </div>

      ${analysis.actionItems && analysis.actionItems.length > 0 ? `
        <h2>Acciones Correctivas y Preventivas</h2>
        <table>
          <thead class="actions-header">
            <tr>
              <th>#</th>
              <th>Descripción</th>
              <th>Tipo</th>
              <th>Responsable</th>
              <th>Fecha Límite</th>
              <th>Prioridad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.actionItems.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.description}</td>
                <td>${item.actionType === 'corrective' ? 'Correctiva' : 'Preventiva'}</td>
                <td>${item.assignedTo || '-'}</td>
                <td>${item.dueDate ? formatDate(item.dueDate) : '-'}</td>
                <td class="priority-${item.priority}">${getPriorityLabel(item.priority)}</td>
                <td class="status-${item.status}">${getActionStatusLabel(item.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
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
