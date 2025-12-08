/**
 * Root Cause Report Detail Page
 * View and manage a specific root cause analysis report
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  useRootCauseReport,
  useSubmitRootCauseReport,
  useApproveRootCauseReport,
  useDeleteRootCauseReport,
} from '@/shared/hooks/report-hooks'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { ReportStatusBadge } from '@/shared/components/reports/ReportStatusBadge'
import { ExportButtons } from '@/shared/components/reports/ExportButtons'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Separator } from '@/shared/components/ui/separator'
import { Badge } from '@/shared/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  Edit,
  Send,
  CheckCircle,
  Trash2,
  AlertCircle,
  GitBranch,
  Lightbulb,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const METODOLOGIA_LABELS: Record<string, string> = {
  five_whys: '5 Por Qués',
  fishbone: 'Diagrama de Ishikawa',
  six_sigma: 'Six Sigma',
  fmea: 'FMEA',
  other: 'Otra',
}

export default function RootCauseReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: report, error, isLoading } = useRootCauseReport(id)
  const { trigger: submitReport, isMutating: isSubmitting } = useSubmitRootCauseReport(id)
  const { trigger: approveReport, isMutating: isApproving } = useApproveRootCauseReport(id)
  const { trigger: deleteReport, isMutating: isDeleting } = useDeleteRootCauseReport()

  const handleSubmit = async () => {
    try {
      await submitReport()
      toast.success('Análisis enviado para revisión')
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el análisis')
    }
  }

  const handleApprove = async () => {
    try {
      await approveReport()
      toast.success('Análisis aprobado exitosamente')
    } catch (error: any) {
      toast.error(error.message || 'Error al aprobar el análisis')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteReport(id)
      toast.success('Análisis eliminado exitosamente')
      router.push('/reports/root-cause')
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el análisis')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar el análisis
            </h3>
            <p className="text-gray-600 mb-4">
              {error?.message || 'El análisis no fue encontrado'}
            </p>
            <Button onClick={() => router.push('/reports/root-cause')}>
              Volver a la lista
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ReportFormHeader
        title="Detalle de Análisis de Causa Raíz"
        description={`Creado el ${format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}`}
        backUrl="/reports/root-cause"
      />

      {/* Status and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <ReportStatusBadge status={report.report_status} size="lg" />
          <Badge variant="outline" className="text-base">
            {METODOLOGIA_LABELS[report.metodologia] || report.metodologia}
          </Badge>
        </div>
        <div className="flex gap-2">
          {report.report_status === 'draft' && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/reports/root-cause/${id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Send className="h-4 w-4 mr-2" />
                Enviar para Revisión
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. El análisis será eliminado permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          {report.report_status === 'submitted' && (
            <Button onClick={handleApprove} disabled={isApproving}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Aprobar
            </Button>
          )}
          <ExportButtons
            reportType="root-cause"
            reportId={id}
            reportStatus={report.report_status}
          />
        </div>
      </div>

      {/* Analysis Tables */}
      {!report.analysis_tables || report.analysis_tables.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay tablas de análisis registradas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {report.analysis_tables.map((table, tableIndex) => (
            <Card key={tableIndex} className="border-2 border-blue-100">
              <CardHeader className="bg-blue-50">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-blue-600" />
                  <CardTitle>Tabla de Análisis #{table.table_number}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Observation/Fact */}
                {table.hecho_observacion && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Hecho / Observación
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                      {table.hecho_observacion}
                    </p>
                  </div>
                )}

                <Separator />

                {/* Whys */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Los 5 Por Qués
                  </h3>
                  <div className="space-y-3">
                    {table.porques && table.porques.length > 0 ? (
                      table.porques.map((why, whyIndex) => (
                        <Card key={whyIndex} className="bg-gray-50 border-l-4 border-l-blue-600">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-blue-600">
                                Por qué #{why.numero}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-1">Pregunta:</p>
                              <p className="text-sm text-gray-700 font-medium">
                                {why.pregunta}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 mb-1">Respuesta:</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {why.respuesta || <span className="text-gray-400 italic">Sin respuesta</span>}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">No hay "por qués" registrados</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Action Plan */}
                {table.accion_plan && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Plan de Acción
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap bg-green-50 p-4 rounded-md border-l-4 border-l-green-600">
                      {table.accion_plan}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
