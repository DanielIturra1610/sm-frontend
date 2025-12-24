import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, WidthType, BorderStyle, AlignmentType, ImageRun } from 'docx'
import { saveAs } from 'file-saver'
import type { CausalTreeAnalysis, CausalNode } from '@/shared/types/causal-tree'
import { NODE_TYPE_LABELS, FACT_TYPE_LABELS, RELATION_TYPE_LABELS } from '@/shared/types/causal-tree'

// Incident info for export filename
export interface ExportIncidentInfo {
  empresa?: string
  tipo?: string
  fecha?: string
  correlativo?: string
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

// Helper to format date for filename (short format)
function formatDateForFilename(date: string | Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Helper to generate export filename
// Format: [Empresa] Reporte Árbol Causal [Tipo Incidente] [Fecha] [Correlativo].[ext]
function generateExportFilename(
  incidentInfo: ExportIncidentInfo | undefined,
  extension: string
): string {
  const parts: string[] = []

  // Empresa
  if (incidentInfo?.empresa) {
    parts.push(incidentInfo.empresa.trim())
  }

  // Tipo de reporte
  parts.push('Reporte Árbol Causal')

  // Tipo de incidente
  if (incidentInfo?.tipo) {
    parts.push(incidentInfo.tipo.trim())
  }

  // Fecha
  if (incidentInfo?.fecha) {
    parts.push(formatDateForFilename(incidentInfo.fecha))
  } else {
    parts.push(formatDateForFilename(new Date()))
  }

  // Correlativo
  if (incidentInfo?.correlativo) {
    parts.push(incidentInfo.correlativo.trim())
  }

  // Clean and join parts, replace spaces with underscores for filename safety
  const filename = parts
    .filter(Boolean)
    .join(' ')
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()

  return `${filename}.${extension}`
}

// Helper to get node type label
function getNodeTypeLabel(nodeType: string): string {
  return NODE_TYPE_LABELS[nodeType as keyof typeof NODE_TYPE_LABELS] || nodeType
}

// Helper to get fact type label
function getFactTypeLabel(factType: string): string {
  return FACT_TYPE_LABELS[factType as keyof typeof FACT_TYPE_LABELS] || factType
}

// Helper to get relation type label
function getRelationTypeLabel(relationType: string): string {
  return RELATION_TYPE_LABELS[relationType as keyof typeof RELATION_TYPE_LABELS] || relationType
}

// Get parent facts as string
function getParentFacts(node: CausalNode, nodes: CausalNode[]): string {
  if (!node.parentNodes || node.parentNodes.length === 0) return '-'

  const parentFacts = node.parentNodes
    .map(parentId => {
      const parentNode = nodes.find(n => n.id === parentId)
      return parentNode ? `${parentNode.numero}. ${parentNode.fact}` : ''
    })
    .filter(Boolean)

  return parentFacts.join('\n') || '-'
}

// Helper to get causes for a node as string with numbers
function getCausesNumbers(node: CausalNode, nodes: CausalNode[]): string {
  if (!node.parentNodes || node.parentNodes.length === 0) return ''

  const causeNumbers = node.parentNodes
    .map(parentId => {
      const parentNode = nodes.find(n => n.id === parentId)
      return parentNode?.numero
    })
    .filter(Boolean)
    .sort((a, b) => (a || 0) - (b || 0))

  return causeNumbers.join(', ')
}

// Build tree level structure for visualization
function buildTreeLevels(analysis: CausalTreeAnalysis): Map<number, CausalNode[]> {
  const levels = new Map<number, CausalNode[]>()

  // Find final event first
  const finalEvent = analysis.nodes.find(n => n.nodeType === 'final_event')
  if (!finalEvent) return levels

  // BFS to calculate depth from final event
  const depths = new Map<string, number>()
  depths.set(finalEvent.id, 0)
  const queue = [finalEvent.id]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const currentDepth = depths.get(currentId)!
    const currentNode = analysis.nodes.find(n => n.id === currentId)

    if (!currentNode) continue

    // Causes are children in the visual tree
    if (currentNode.parentNodes) {
      currentNode.parentNodes.forEach(causeId => {
        if (!depths.has(causeId)) {
          depths.set(causeId, currentDepth + 1)
          queue.push(causeId)
        }
      })
    }
  }

  // Group by depth
  analysis.nodes.forEach(node => {
    const depth = depths.get(node.id) || 0
    const level = levels.get(depth) || []
    level.push(node)
    levels.set(depth, level)
  })

  // Sort within each level
  levels.forEach((nodes) => {
    nodes.sort((a, b) => a.numero - b.numero)
  })

  return levels
}

// ============================================
// EXCEL EXPORT - Template format
// ============================================
export async function exportToExcel(
  analysis: CausalTreeAnalysis,
  incidentInfo?: ExportIncidentInfo
): Promise<void> {
  const workbook = XLSX.utils.book_new()
  const sortedNodes = [...analysis.nodes].sort((a, b) => a.numero - b.numero)
  const treeLevels = buildTreeLevels(analysis)
  const maxLevel = Math.max(...Array.from(treeLevels.keys()), 0)

  // ========== Sheet 1: Investigación de Causas (Main template) ==========
  const mainData: (string | number)[][] = []

  // Header section - Construcción del Árbol
  mainData.push(['Construcción del Árbol', '', 'Método Lógico-Gráfico', '', '', '', '', '', 'SIMBOLOGÍA'])
  mainData.push(['¿Cuál es el último hecho?', getFinalEvent(analysis), '', '', '', '', '', '', '○ Hecho o Variación'])
  mainData.push(['¿Qué antecedente fué necesario para', '', '', '', '', '', '', '', '□ Hecho Permanente'])
  mainData.push(['que se produjera el último hecho?', '', '', '', '', '', '', '', ''])
  mainData.push(['¿Fue necesario otro antecedente?', '', '', '', '', '', '', '', '→ Vinculación Confirmada'])
  mainData.push(['¿Fue necesario otro antecedente?', '', '', '', '', '', '', '', '- → Vinculación Aparente'])
  mainData.push(['¿Fue necesario otro antecedente?', '', '', '', '', '', '', '', ''])
  mainData.push([])

  // Lista de Hechos section
  mainData.push(['Lista de Hechos', '', 'Árbol de Causas'])

  // Add numbered rows for facts
  for (let i = 1; i <= Math.max(sortedNodes.length, 8); i++) {
    const node = sortedNodes.find(n => n.numero === i)
    const factTypeSymbol = node?.factType === 'permanente' ? '□' : '○'
    const fact = node ? `${factTypeSymbol} ${node.fact}` : ''
    const causes = node ? getCausesNumbers(node, analysis.nodes) : ''
    const isRootCause = node?.isRootCause ? ' [CAUSA RAÍZ]' : ''

    mainData.push([
      i,
      fact + isRootCause,
      causes,
    ])
  }

  mainData.push([])

  // Add tree structure representation
  mainData.push(['', '', 'Estructura del Árbol (por niveles):'])
  for (let level = 0; level <= maxLevel; level++) {
    const nodesAtLevel = treeLevels.get(level) || []
    const nodeNumbers = nodesAtLevel.map(n => {
      const symbol = n.factType === 'permanente' ? '□' : '○'
      return `${symbol}${n.numero}`
    }).join('  ')
    const levelName = level === 0 ? 'Evento Final' : level === maxLevel ? 'Causas Raíz' : `Nivel ${level}`
    mainData.push(['', '', `${levelName}: ${nodeNumbers}`])
  }

  const mainSheet = XLSX.utils.aoa_to_sheet(mainData)
  mainSheet['!cols'] = [
    { wch: 35 },  // Column A - Labels
    { wch: 50 },  // Column B - Facts
    { wch: 30 },  // Column C - Tree/Causes
    { wch: 10 },  // Column D
    { wch: 10 },  // Column E
    { wch: 10 },  // Column F
    { wch: 10 },  // Column G
    { wch: 10 },  // Column H
    { wch: 25 },  // Column I - Simbología
  ]

  // Set row heights and merge cells for header
  mainSheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },  // Construcción del Árbol
    { s: { r: 0, c: 2 }, e: { r: 0, c: 7 } },  // Método Lógico-Gráfico
  ]

  XLSX.utils.book_append_sheet(workbook, mainSheet, 'Investigación de Causas')

  // ========== Sheet 2: Lista de Hechos Detallada ==========
  const factsHeaders = ['N°', 'Hecho', 'Tipo Nodo', 'Tipo Hecho', 'Causa Raíz', 'Antecedentes (N°)', 'Evidencias']
  const factsData = sortedNodes.map(node => [
    node.numero || '-',
    node.fact,
    getNodeTypeLabel(node.nodeType),
    getFactTypeLabel(node.factType),
    node.isRootCause ? 'SÍ' : 'NO',
    getCausesNumbers(node, analysis.nodes) || '-',
    node.evidence?.join(', ') || '-',
  ])

  const factsSheet = XLSX.utils.aoa_to_sheet([factsHeaders, ...factsData])
  factsSheet['!cols'] = [
    { wch: 5 },   // N°
    { wch: 50 },  // Hecho
    { wch: 14 },  // Tipo Nodo
    { wch: 12 },  // Tipo Hecho
    { wch: 10 },  // Causa Raíz
    { wch: 15 },  // Antecedentes
    { wch: 30 },  // Evidencias
  ]
  XLSX.utils.book_append_sheet(workbook, factsSheet, 'Lista de Hechos')

  // ========== Sheet 3: Árbol Visual (Tree structure) ==========
  const treeData: (string | number)[][] = []
  treeData.push(['ÁRBOL DE CAUSAS - Representación por Niveles'])
  treeData.push([])

  // Visual tree header
  const maxNodesInLevel = Math.max(...Array.from(treeLevels.values()).map(n => n.length), 1)
  const treeHeader = ['Nivel', ...Array(maxNodesInLevel * 2).fill('').map((_, i) => i % 2 === 0 ? 'N°' : 'Descripción')]
  treeData.push(treeHeader)

  // Add each level
  for (let level = 0; level <= maxLevel; level++) {
    const nodesAtLevel = treeLevels.get(level) || []
    const levelName = level === 0 ? 'Evento Final' : level === maxLevel && analysis.rootCauses.length > 0 ? 'Causas Raíz' : `Nivel ${level}`
    const row: (string | number)[] = [levelName]

    nodesAtLevel.forEach(node => {
      const symbol = node.factType === 'permanente' ? '□ ' : '○ '
      row.push(node.numero)
      row.push(symbol + node.fact.substring(0, 50) + (node.fact.length > 50 ? '...' : ''))
    })

    treeData.push(row)
  }

  treeData.push([])
  treeData.push(['Relaciones:'])
  sortedNodes.forEach(node => {
    if (node.parentNodes && node.parentNodes.length > 0) {
      const causes = getCausesNumbers(node, analysis.nodes)
      treeData.push([`Hecho ${node.numero} ← antecedentes: ${causes}`])
    }
  })

  const treeSheet = XLSX.utils.aoa_to_sheet(treeData)
  treeSheet['!cols'] = [
    { wch: 15 },
    ...Array(maxNodesInLevel * 2).fill(null).map((_, i) => ({ wch: i % 2 === 0 ? 5 : 40 }))
  ]
  XLSX.utils.book_append_sheet(workbook, treeSheet, 'Árbol de Causas')

  // ========== Sheet 4: Causas Raíz ==========
  if (analysis.rootCauses.length > 0) {
    const rootCauseData: (string | number)[][] = [
      ['CAUSAS RAÍZ IDENTIFICADAS'],
      [],
      ['N°', 'N° Hecho', 'Descripción', 'Tipo de Hecho', 'Evidencias'],
    ]

    analysis.rootCauses.forEach((rootCauseId, index) => {
      const node = analysis.nodes.find(n => n.id === rootCauseId)
      if (node) {
        rootCauseData.push([
          index + 1,
          node.numero,
          node.fact,
          getFactTypeLabel(node.factType),
          node.evidence?.join(', ') || '-',
        ])
      }
    })

    const rootCauseSheet = XLSX.utils.aoa_to_sheet(rootCauseData)
    rootCauseSheet['!cols'] = [{ wch: 5 }, { wch: 8 }, { wch: 50 }, { wch: 15 }, { wch: 40 }]
    XLSX.utils.book_append_sheet(workbook, rootCauseSheet, 'Causas Raíz')
  }

  // ========== Sheet 5: Medidas Preventivas ==========
  if (analysis.preventiveMeasures.length > 0) {
    const measuresHeaders = ['N°', 'Descripción', 'Tipo', 'Prioridad', 'Estado', 'Responsable', 'Fecha Límite']
    const measuresData = analysis.preventiveMeasures.map((measure, index) => [
      index + 1,
      measure.description,
      measure.measureType === 'preventive' ? 'Preventiva' : 'Correctiva',
      measure.priority === 'high' ? 'Alta' : measure.priority === 'medium' ? 'Media' : 'Baja',
      measure.status === 'pending' ? 'Pendiente' : measure.status === 'in_progress' ? 'En Progreso' : 'Completada',
      measure.responsible || '-',
      measure.dueDate ? formatDate(measure.dueDate) : '-',
    ])

    const measuresSheet = XLSX.utils.aoa_to_sheet([measuresHeaders, ...measuresData])
    measuresSheet['!cols'] = [
      { wch: 5 },
      { wch: 50 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
    ]
    XLSX.utils.book_append_sheet(workbook, measuresSheet, 'Medidas Preventivas')
  }

  // ========== Sheet 6: Resumen ==========
  const summaryData = [
    ['RESUMEN DEL ANÁLISIS'],
    [],
    ['Información General'],
    ['Título:', getDisplayTitle(analysis)],
    ['Evento Final (Lesión):', getFinalEvent(analysis)],
    ['Descripción:', analysis.description || '-'],
    ['Estado:', getStatusLabel(analysis.status)],
    ['Fecha de Inicio:', formatDate(analysis.createdAt)],
    ['Fecha de Actualización:', formatDate(analysis.updatedAt)],
    [],
    ['Estadísticas'],
    ['Total de Hechos:', analysis.nodes.length],
    ['Causas Raíz Identificadas:', analysis.rootCauses.length],
    ['Medidas Preventivas:', analysis.preventiveMeasures.length],
    ['Niveles del Árbol:', maxLevel + 1],
  ]

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  summarySheet['!cols'] = [{ wch: 25 }, { wch: 60 }]
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')

  // Generate and download
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const filename = generateExportFilename(incidentInfo, 'xlsx')
  saveAs(blob, filename)
}

// ============================================
// WORD EXPORT
// ============================================
export async function exportToWord(
  analysis: CausalTreeAnalysis,
  diagramImage?: string,
  incidentInfo?: ExportIncidentInfo
): Promise<void> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: 'INVESTIGACIÓN DE CAUSAS',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: 'Análisis de Árbol Causal',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: '' }),

          // General Info
          new Paragraph({
            text: '1. INFORMACIÓN GENERAL',
            heading: HeadingLevel.HEADING_2,
          }),
          createInfoTable([
            ['Título:', getDisplayTitle(analysis)],
            ['Evento Final (Lesión):', getFinalEvent(analysis)],
            ['Descripción:', analysis.description || '-'],
            ['Estado:', getStatusLabel(analysis.status)],
            ['Fecha de Inicio:', formatDate(analysis.createdAt)],
          ]),
          new Paragraph({ text: '' }),

          // Statistics
          new Paragraph({
            text: '2. ESTADÍSTICAS',
            heading: HeadingLevel.HEADING_2,
          }),
          createInfoTable([
            ['Total de Hechos:', String(analysis.nodes.length)],
            ['Causas Raíz Identificadas:', String(analysis.rootCauses.length)],
            ['Medidas Preventivas:', String(analysis.preventiveMeasures.length)],
            ['Profundidad del Árbol:', String(Math.max(...analysis.nodes.map(n => n.level), 0))],
          ]),
          new Paragraph({ text: '' }),

          // Facts List
          new Paragraph({
            text: '3. LISTA DE HECHOS',
            heading: HeadingLevel.HEADING_2,
          }),
          createFactsTable(analysis.nodes),
          new Paragraph({ text: '' }),

          // Root Causes
          new Paragraph({
            text: '4. CAUSAS RAÍZ IDENTIFICADAS',
            heading: HeadingLevel.HEADING_2,
          }),
          ...createRootCausesList(analysis),
          new Paragraph({ text: '' }),

          // Preventive Measures
          new Paragraph({
            text: '5. MEDIDAS PREVENTIVAS Y CORRECTIVAS',
            heading: HeadingLevel.HEADING_2,
          }),
          ...createMeasuresList(analysis),
          ...createDiagramSection(diagramImage),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const filename = generateExportFilename(incidentInfo, 'docx')
  saveAs(blob, filename)
}

function createInfoTable(rows: string[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })],
            }),
            new TableCell({
              width: { size: 70, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ text: value })],
            }),
          ],
        })
    ),
  })
}

function createFactsTable(nodes: CausalNode[]): Table {
  const sortedNodes = [...nodes].sort((a, b) => a.numero - b.numero)

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header row
      new TableRow({
        tableHeader: true,
        children: ['N°', 'Hecho', 'Tipo', 'Causa Raíz'].map(
          (header) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
              shading: { fill: 'E0E0E0' },
            })
        ),
      }),
      // Data rows
      ...sortedNodes.map(
        (node) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 8, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: String(node.numero || '-') })],
              }),
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: node.fact })],
              }),
              new TableCell({
                width: { size: 17, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: getNodeTypeLabel(node.nodeType) })],
              }),
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ text: node.isRootCause ? 'SÍ' : 'NO' })],
              }),
            ],
          })
      ),
    ],
  })
}

function createRootCausesList(analysis: CausalTreeAnalysis): Paragraph[] {
  if (analysis.rootCauses.length === 0) {
    return [new Paragraph({ text: 'No se han identificado causas raíz.' })]
  }

  return analysis.rootCauses.map((rootCauseId, index) => {
    const node = analysis.nodes.find((n) => n.id === rootCauseId)
    if (!node) return new Paragraph({ text: `${index + 1}. (No encontrado)` })

    return new Paragraph({
      children: [
        new TextRun({ text: `${index + 1}. `, bold: true }),
        new TextRun({ text: node.fact }),
        node.evidence && node.evidence.length > 0
          ? new TextRun({ text: ` (Evidencias: ${node.evidence.join(', ')})`, italics: true })
          : new TextRun({ text: '' }),
      ],
    })
  })
}

function createMeasuresList(analysis: CausalTreeAnalysis): Paragraph[] {
  if (analysis.preventiveMeasures.length === 0) {
    return [new Paragraph({ text: 'No se han definido medidas preventivas.' })]
  }

  return analysis.preventiveMeasures.flatMap((measure, index) => [
    new Paragraph({
      children: [
        new TextRun({ text: `${index + 1}. `, bold: true }),
        new TextRun({ text: measure.description }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({ text: '   Tipo: ', bold: true }),
        new TextRun({ text: measure.measureType === 'preventive' ? 'Preventiva' : 'Correctiva' }),
        new TextRun({ text: ' | Prioridad: ', bold: true }),
        new TextRun({ text: measure.priority === 'high' ? 'Alta' : measure.priority === 'medium' ? 'Media' : 'Baja' }),
        new TextRun({ text: ' | Estado: ', bold: true }),
        new TextRun({ text: measure.status === 'pending' ? 'Pendiente' : measure.status === 'in_progress' ? 'En Progreso' : 'Completada' }),
      ],
    }),
  ])
}

// ============================================
// PDF EXPORT (Print-friendly HTML)
// ============================================
export function exportToPDF(
  analysis: CausalTreeAnalysis,
  diagramImage?: string,
  incidentInfo?: ExportIncidentInfo
): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Por favor permite las ventanas emergentes para exportar a PDF')
    return
  }

  const htmlContent = generatePrintHTML(analysis, diagramImage, incidentInfo)
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  printWindow.onload = () => {
    // Set document title for save as PDF filename
    const suggestedFilename = generateExportFilename(incidentInfo, 'pdf').replace('.pdf', '')
    printWindow.document.title = suggestedFilename
    printWindow.print()
  }
}

function generatePrintHTML(
  analysis: CausalTreeAnalysis,
  diagramImage?: string,
  incidentInfo?: ExportIncidentInfo
): string {
  const sortedNodes = [...analysis.nodes].sort((a, b) => a.numero - b.numero)
  const documentTitle = incidentInfo
    ? generateExportFilename(incidentInfo, 'pdf').replace('.pdf', '')
    : `Investigación de Causas - ${getDisplayTitle(analysis)}`

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${documentTitle}</title>
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          margin: 20mm;
          color: #333;
        }
        h1 {
          text-align: center;
          font-size: 18pt;
          margin-bottom: 5px;
          color: #1a1a1a;
        }
        h2 {
          font-size: 14pt;
          border-bottom: 2px solid #333;
          padding-bottom: 5px;
          margin-top: 20px;
          color: #1a1a1a;
        }
        h3 {
          text-align: center;
          font-size: 12pt;
          margin-top: 0;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          page-break-inside: avoid;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        .info-table td:first-child {
          width: 200px;
          font-weight: bold;
          background-color: #f9f9f9;
        }
        .root-cause {
          background-color: #d4edda;
        }
        .final-event {
          background-color: #f8d7da;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin: 10px 0;
        }
        .stat-box {
          border: 1px solid #ccc;
          padding: 10px;
          text-align: center;
          background: #f9f9f9;
        }
        .stat-value {
          font-size: 24pt;
          font-weight: bold;
          color: #333;
        }
        .stat-label {
          font-size: 9pt;
          color: #666;
        }
        .measure-item {
          margin-bottom: 15px;
          padding: 10px;
          border-left: 3px solid #007bff;
          background: #f8f9fa;
        }
        .measure-meta {
          font-size: 9pt;
          color: #666;
          margin-top: 5px;
        }
        @media print {
          body { margin: 15mm; }
          h2 { page-break-after: avoid; }
          table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>INVESTIGACIÓN DE CAUSAS</h1>
      <h3>Análisis de Árbol Causal</h3>

      <h2>1. Información General</h2>
      <table class="info-table">
        <tr><td>Título:</td><td>${getDisplayTitle(analysis)}</td></tr>
        <tr><td>Evento Final (Lesión):</td><td>${getFinalEvent(analysis)}</td></tr>
        <tr><td>Descripción:</td><td>${analysis.description || '-'}</td></tr>
        <tr><td>Estado:</td><td>${getStatusLabel(analysis.status)}</td></tr>
        <tr><td>Fecha de Inicio:</td><td>${formatDate(analysis.createdAt)}</td></tr>
        <tr><td>Última Actualización:</td><td>${formatDate(analysis.updatedAt)}</td></tr>
      </table>

      <h2>2. Estadísticas</h2>
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${analysis.nodes.length}</div>
          <div class="stat-label">Total de Hechos</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${analysis.rootCauses.length}</div>
          <div class="stat-label">Causas Raíz</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${analysis.preventiveMeasures.length}</div>
          <div class="stat-label">Medidas Preventivas</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${Math.max(...analysis.nodes.map(n => n.level), 0)}</div>
          <div class="stat-label">Profundidad</div>
        </div>
      </div>

      <h2>3. Lista de Hechos</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">N°</th>
            <th>Hecho</th>
            <th style="width: 100px;">Tipo de Nodo</th>
            <th style="width: 80px;">Tipo Hecho</th>
            <th style="width: 70px;">Causa Raíz</th>
          </tr>
        </thead>
        <tbody>
          ${sortedNodes.map(node => `
            <tr class="${node.nodeType === 'root_cause' ? 'root-cause' : node.nodeType === 'final_event' ? 'final-event' : ''}">
              <td>${node.numero || '-'}</td>
              <td>${node.fact}</td>
              <td>${getNodeTypeLabel(node.nodeType)}</td>
              <td>${getFactTypeLabel(node.factType)}</td>
              <td>${node.isRootCause ? 'SÍ' : 'NO'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>4. Causas Raíz Identificadas</h2>
      ${analysis.rootCauses.length === 0
        ? '<p>No se han identificado causas raíz.</p>'
        : `<table>
            <thead>
              <tr>
                <th style="width: 40px;">N°</th>
                <th>Descripción de la Causa Raíz</th>
                <th style="width: 200px;">Evidencias</th>
              </tr>
            </thead>
            <tbody>
              ${analysis.rootCauses.map((rootCauseId, index) => {
                const node = analysis.nodes.find(n => n.id === rootCauseId)
                return node ? `
                  <tr class="root-cause">
                    <td>${index + 1}</td>
                    <td>${node.fact}</td>
                    <td>${node.evidence?.join(', ') || '-'}</td>
                  </tr>
                ` : ''
              }).join('')}
            </tbody>
          </table>`
      }

      <h2>5. Medidas Preventivas y Correctivas</h2>
      ${analysis.preventiveMeasures.length === 0
        ? '<p>No se han definido medidas preventivas.</p>'
        : analysis.preventiveMeasures.map((measure, index) => `
            <div class="measure-item">
              <strong>${index + 1}. ${measure.description}</strong>
              <div class="measure-meta">
                <strong>Tipo:</strong> ${measure.measureType === 'preventive' ? 'Preventiva' : 'Correctiva'} |
                <strong>Prioridad:</strong> ${measure.priority === 'high' ? 'Alta' : measure.priority === 'medium' ? 'Media' : 'Baja'} |
                <strong>Estado:</strong> ${measure.status === 'pending' ? 'Pendiente' : measure.status === 'in_progress' ? 'En Progreso' : 'Completada'}
                ${measure.responsible ? ` | <strong>Responsable:</strong> ${measure.responsible}` : ''}
                ${measure.dueDate ? ` | <strong>Fecha Límite:</strong> ${formatDate(measure.dueDate)}` : ''}
              </div>
            </div>
          `).join('')
      }

      ${diagramImage ? `
      <h2>6. Diagrama del Árbol Causal</h2>
      <div style="text-align: center; margin: 20px 0;">
        <img src="${diagramImage}" style="max-width: 100%; height: auto; border: 1px solid #ccc;" alt="Diagrama del Árbol Causal" />
      </div>
      ` : ""}

      <div style="margin-top: 40px; text-align: center; color: #999; font-size: 9pt;">
        Documento generado el ${formatDate(new Date())}
      </div>
    </body>
    </html>
  `
}


// Helper to create diagram section for Word
function createDiagramSection(diagramImage?: string): (Paragraph)[] {
  if (!diagramImage) return []
  
  // Convert base64 data URL to buffer
  const base64Data = diagramImage.replace(/^data:image\/\w+;base64,/, "")
  const imageBuffer = Buffer.from(base64Data, "base64")
  
  return [
    new Paragraph({ text: "" }),
    new Paragraph({
      text: "6. DIAGRAMA DEL ÁRBOL CAUSAL",
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      children: [
        new ImageRun({
          data: imageBuffer,
          transformation: {
            width: 600,
            height: 400,
          },
          type: "png",
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  ]
}

function getStatusLabel(status: string | undefined | null): string {
  if (!status) return 'Sin estado'

  const labels: Record<string, string> = {
    draft: 'Borrador',
    in_progress: 'En Progreso',
    completed: 'Completado',
    reviewed: 'Revisado',
    archived: 'Archivado',
  }
  return labels[status] || status
}

// Helper to get a display title (title or fallback to finalEvent)
function getDisplayTitle(analysis: CausalTreeAnalysis): string {
  if (analysis.title && analysis.title.trim()) {
    return analysis.title.trim()
  }
  if (analysis.finalEvent && analysis.finalEvent.trim()) {
    return analysis.finalEvent.trim()
  }
  return 'Sin título'
}

// Helper to get final event (with fallback)
function getFinalEvent(analysis: CausalTreeAnalysis): string {
  return (analysis.finalEvent && analysis.finalEvent.trim()) || 'No especificado'
}
