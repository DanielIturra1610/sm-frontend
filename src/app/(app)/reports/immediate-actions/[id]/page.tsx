/**
 * Immediate Actions Report Detail Page
 * View and manage a specific immediate actions report
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  useImmediateActionsReport,
  useSubmitImmediateActionsReport,
  useApproveImmediateActionsReport,
  useDeleteImmediateActionsReport,
} from '@/shared/hooks/report-hooks'
import { useIncident } from '@/shared/hooks/incident-hooks'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import { toast } from 'sonner'
import {
  Edit,
  Send,
  CheckCircle,
  Trash2,
  AlertCircle,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ImmediateActionsReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: report, error, isLoading } = useImmediateActionsReport(id)
  const { trigger: submitReport, isMutating: isSubmitting } = useSubmitImmediateActionsReport(id)
  const { trigger: approveReport, isMutating: isApproving } = useApproveImmediateActionsReport(id)
  const { trigger: deleteReport, isMutating: isDeleting } = useDeleteImmediateActionsReport()
  const { data: incident } = useIncident(report?.incident_id || '')

  const handleSubmit = async () => {
    try {
      await submitReport()
      toast.success('Reporte enviado para revisión')
    } catch (error: any) {
      toast.error(error.message || 'Error al enviar el reporte')
    }
  }

  const handleApprove = async () => {
    try {
      await approveReport()
      toast.success('Reporte aprobado exitosamente')
    } catch (error: any) {
      toast.error(error.message || 'Error al aprobar el reporte')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteReport(id)
      toast.success('Reporte eliminado exitosamente')
      router.push('/reports/immediate-actions')
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el reporte')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar el reporte
            </h3>
            <p className="text-gray-600 mb-4">
              {error?.message || 'El reporte no fue encontrado'}
            </p>
            <Button onClick={() => router.push('/reports/immediate-actions')}>
              Volver a la lista
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ReportFormHeader
        title="Detalle de Reporte de Acciones Inmediatas"
        description={`Creado el ${format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}`}
        backUrl="/reports/immediate-actions"
      />

      {/* Status and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <ReportStatusBadge status={report.report_status} size="lg" />
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">
              {report.porcentaje_avance_plan || 0}%
            </span>
            <span className="text-sm text-gray-500">Avance General</span>
          </div>
        </div>
        <div className="flex gap-2">
          {report.report_status === 'draft' && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/reports/immediate-actions/${id}/edit`)}
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
                      Esta acción no se puede deshacer. El reporte será eliminado permanentemente.
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
            reportType="immediate-actions"
            reportId={id}
            reportStatus={report.report_status}
            metadata={{
              tipoIncidente: incident?.tipo,
              fecha: incident?.fecha_ocurrencia ? new Date(incident.fecha_ocurrencia).toISOString().split('T')[0] : undefined,
              correlativo: incident?.correlativo,
            }}
          />
        </div>
      </div>

      {/* Period Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Período del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.fecha_inicio && (
              <div>
                <p className="text-sm text-gray-500">Fecha de Inicio</p>
                <p className="font-medium">
                  {format(new Date(report.fecha_inicio), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
            )}
            {report.fecha_termino && (
              <div>
                <p className="text-sm text-gray-500">Fecha de Término</p>
                <p className="font-medium">
                  {format(new Date(report.fecha_termino), 'dd/MM/yyyy', { locale: es })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Inmediatas</CardTitle>
        </CardHeader>
        <CardContent>
          {!report.items || report.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay acciones registradas
            </div>
          ) : (
            <div className="space-y-4">
              {report.items.map((item, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="font-mono">
                            #{item.numero}
                          </Badge>
                          <h3 className="font-semibold text-gray-900">{item.tarea}</h3>
                        </div>
                        {item.tipo_acc_inc && (
                          <Badge variant="secondary" className="text-xs">
                            {item.tipo_acc_inc}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                      {item.inicio && (
                        <div>
                          <p className="text-xs text-gray-500">Inicio</p>
                          <p className="text-sm font-medium">
                            {format(new Date(item.inicio), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                      )}
                      {item.fin && (
                        <div>
                          <p className="text-xs text-gray-500">Fin</p>
                          <p className="text-sm font-medium">
                            {format(new Date(item.fin), 'dd/MM/yyyy', { locale: es })}
                          </p>
                        </div>
                      )}
                      {item.responsable && (
                        <div>
                          <p className="text-xs text-gray-500">Responsable</p>
                          <p className="text-sm font-medium">{item.responsable}</p>
                        </div>
                      )}
                      {item.cliente && (
                        <div>
                          <p className="text-xs text-gray-500">Cliente</p>
                          <p className="text-sm font-medium">{item.cliente}</p>
                        </div>
                      )}
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-500">Avance Real</p>
                          <p className="text-sm font-semibold text-blue-600">
                            {item.avance_real}%
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${item.avance_real}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-gray-500">Avance Programado</p>
                          <p className="text-sm font-semibold text-green-600">
                            {item.avance_programado}%
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${item.avance_programado}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {item.comentario && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Comentarios</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {item.comentario}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
