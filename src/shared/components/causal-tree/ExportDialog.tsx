'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import {
  FileSpreadsheet,
  FileText,
  FileImage,
  File,
  Download,
  Loader2,
  CheckCircle2,
  FileCheck,
} from 'lucide-react'
import { Separator } from '@/shared/components/ui/separator'
import type { CausalTreeAnalysis } from '@/shared/types/causal-tree'
import { exportToExcel, exportToWord, exportToPDF, type ExportIncidentInfo } from '@/shared/utils/causal-tree-export'

type ExportFormat = 'excel' | 'word' | 'pdf' | 'image'

interface ExportOption {
  id: ExportFormat
  label: string
  description: string
  icon: React.ReactNode
  extension: string
}

const exportOptions: ExportOption[] = [
  {
    id: 'excel',
    label: 'Excel',
    description: 'Hojas de cálculo editables con toda la información del análisis',
    icon: <FileSpreadsheet className="h-6 w-6 text-green-600" />,
    extension: '.xlsx',
  },
  {
    id: 'word',
    label: 'Word',
    description: 'Documento editable con formato profesional',
    icon: <FileText className="h-6 w-6 text-blue-600" />,
    extension: '.docx',
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Documento para impresión o compartir (abre ventana de impresión)',
    icon: <File className="h-6 w-6 text-red-600" />,
    extension: '.pdf',
  },
  {
    id: 'image',
    label: 'Imagen PNG',
    description: 'Captura de alta calidad del diagrama del árbol',
    icon: <FileImage className="h-6 w-6 text-purple-600" />,
    extension: '.png',
  },
]

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  analysis: CausalTreeAnalysis
  incidentInfo?: ExportIncidentInfo
  onExportImage?: () => Promise<void>
  onGetDiagramImage?: () => Promise<string | null>
  // Props for saving to Final Report
  onSaveForFinalReport?: () => Promise<void>
  isSavingForFinalReport?: boolean
  isImageAlreadySaved?: boolean
  hasIncidentId?: boolean
}

export function ExportDialog({
  open,
  onOpenChange,
  analysis,
  incidentInfo,
  onExportImage,
  onGetDiagramImage,
  onSaveForFinalReport,
  isSavingForFinalReport = false,
  isImageAlreadySaved = false,
  hasIncidentId = false,
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel')
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState<ExportFormat | null>(null)

  const handleExport = async () => {
    setIsExporting(true)
    setExportSuccess(null)

    try {
      switch (selectedFormat) {
        case 'excel':
          await exportToExcel(analysis, incidentInfo)
          break
        case 'word': {
          const wordImage = onGetDiagramImage ? await onGetDiagramImage() : null
          await exportToWord(analysis, wordImage || undefined, incidentInfo)
          break
        }
        case 'pdf': {
          const pdfImage = onGetDiagramImage ? await onGetDiagramImage() : null
          exportToPDF(analysis, pdfImage || undefined, incidentInfo)
          break
        }
        case 'image':
          if (onExportImage) {
            await onExportImage()
          }
          break
      }
      setExportSuccess(selectedFormat)

      // Auto-close after success (except PDF which opens print dialog)
      if (selectedFormat !== 'pdf') {
        setTimeout(() => {
          onOpenChange(false)
          setExportSuccess(null)
        }, 1500)
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Análisis
          </DialogTitle>
          <DialogDescription>
            Selecciona el formato en el que deseas exportar el análisis del árbol causal
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          {exportOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedFormat(option.id)}
              disabled={isExporting}
              className={`
                flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left
                ${selectedFormat === option.id
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex-shrink-0 mt-0.5">
                {exportSuccess === option.id ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  option.icon
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded">
                    {option.extension}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {option.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Save for Final Report */}
        <Separator className="my-2" />
        <div className="py-2">
          <p className="text-sm font-medium mb-2">Guardar para Reporte Final</p>
          <button
            type="button"
            onClick={async () => {
              if (onSaveForFinalReport && !isImageAlreadySaved && !isSavingForFinalReport && hasIncidentId) {
                await onSaveForFinalReport()
              }
            }}
            disabled={isImageAlreadySaved || isSavingForFinalReport || !hasIncidentId}
            className={`
              flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left w-full
              ${isImageAlreadySaved
                ? 'border-green-500 bg-green-50 cursor-not-allowed'
                : !hasIncidentId
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
              }
              ${isSavingForFinalReport ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isSavingForFinalReport ? (
                <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
              ) : isImageAlreadySaved ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <FileCheck className={`h-6 w-6 ${hasIncidentId ? 'text-purple-600' : 'text-gray-400'}`} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="font-medium">
                {isImageAlreadySaved
                  ? 'Imagen ya guardada'
                  : !hasIncidentId
                  ? 'Sin suceso asociado'
                  : 'Guardar diagrama'}
              </span>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isImageAlreadySaved
                  ? 'El diagrama ya está disponible para el Reporte Final'
                  : !hasIncidentId
                  ? 'Este análisis no está vinculado a un suceso. Vincúlalo primero para guardar la imagen.'
                  : 'Guarda la imagen del diagrama para incluirla en el Reporte Final'
                }
              </p>
            </div>
          </button>
        </div>

        {/* Info about export content */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">El archivo incluirá:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>{analysis.nodes.length} hechos registrados</li>
            <li>{analysis.rootCauses.length} causas raíz identificadas</li>
            <li>{analysis.preventiveMeasures.length} medidas preventivas</li>
            {selectedFormat === 'excel' && (
              <li>Múltiples hojas con información detallada</li>
            )}
            {selectedFormat === 'image' && (
              <li>Diagrama del árbol en alta resolución</li>
            )}
          </ul>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Exportado
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar {exportOptions.find(o => o.id === selectedFormat)?.label}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
