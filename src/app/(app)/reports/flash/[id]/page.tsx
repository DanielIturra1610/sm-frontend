/**
 * Flash Report Detail Page
 * View and manage a specific flash report
 */

'use client'

import { useParams, useRouter } from 'next/navigation'
import {
  useFlashReport,
  useSubmitFlashReport,
  useApproveFlashReport,
  useDeleteFlashReport,
} from '@/shared/hooks/report-hooks'
import { useIncidentPhotos } from '@/shared/hooks/attachment-hooks'
import { ReportFormHeader } from '@/shared/components/reports/ReportFormHeader'
import { ReportStatusBadge } from '@/shared/components/reports/ReportStatusBadge'
import { ExportButtons } from '@/shared/components/reports/ExportButtons'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Separator } from '@/shared/components/ui/separator'
import { PhotoGallery } from '@/shared/components/attachments/PhotoGallery'
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
  XCircle,
  Trash2,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  Building2,
  User,
  Camera,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function FlashReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: report, error, isLoading } = useFlashReport(id)
  const { trigger: submitReport, isMutating: isSubmitting } = useSubmitFlashReport(id)
  const { trigger: approveReport, isMutating: isApproving } = useApproveFlashReport(id)
  const { trigger: deleteReport, isMutating: isDeleting } = useDeleteFlashReport()
  const { data: incidentPhotos, isLoading: photosLoading } = useIncidentPhotos(report?.incident_id || null)

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
      router.push('/reports/flash')
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el reporte')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar el reporte
            </h3>
            <p className="text-gray-600 mb-4">
              {error?.message || 'El reporte no fue encontrado'}
            </p>
            <Button onClick={() => router.push('/reports/flash')}>
              Volver a la lista
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <ReportFormHeader
        title="Detalle de Flash Report"
        description={`Creado el ${format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}`}
        backUrl="/reports/flash"
      />

      {/* Status and Actions */}
      <div className="flex items-center justify-between mb-6">
        <ReportStatusBadge status={report.report_status} size="lg" />
        <div className="flex gap-2">
          {report.report_status === 'draft' && (
            <>
              <Button
                variant="outline"
                onClick={() => router.push(`/reports/flash/${id}/edit`)}
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
            reportType="flash-reports"
            reportId={id}
            reportStatus={report.report_status}
          />
        </div>
      </div>

      {/* Basic Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.suceso && (
              <div>
                <p className="text-sm text-gray-500">Suceso</p>
                <p className="font-medium">{report.suceso}</p>
              </div>
            )}
            {report.tipo && (
              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-medium">{report.tipo}</p>
              </div>
            )}
            {report.fecha && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">
                    {format(new Date(report.fecha), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
              </div>
            )}
            {report.hora && (
              <div>
                <p className="text-sm text-gray-500">Hora</p>
                <p className="font-medium">{report.hora}</p>
              </div>
            )}
            {report.lugar && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Lugar</p>
                  <p className="font-medium">{report.lugar}</p>
                </div>
              </div>
            )}
            {report.area_zona && (
              <div>
                <p className="text-sm text-gray-500">Área/Zona</p>
                <p className="font-medium">{report.area_zona}</p>
              </div>
            )}
            {report.empresa && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Empresa</p>
                  <p className="font-medium">{report.empresa}</p>
                </div>
              </div>
            )}
            {report.supervisor && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Supervisor</p>
                  <p className="font-medium">{report.supervisor}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description and Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Descripción y Análisis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.descripcion && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Descripción</p>
              <p className="text-gray-600 whitespace-pre-wrap">{report.descripcion}</p>
              <Separator className="my-4" />
            </div>
          )}
          {report.acciones_inmediatas && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Acciones Inmediatas</p>
              <p className="text-gray-600 whitespace-pre-wrap">{report.acciones_inmediatas}</p>
              <Separator className="my-4" />
            </div>
          )}
          {report.controles_inmediatos && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Controles Inmediatos</p>
              <p className="text-gray-600 whitespace-pre-wrap">{report.controles_inmediatos}</p>
              <Separator className="my-4" />
            </div>
          )}
          {report.factores_riesgo && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Factores de Riesgo</p>
              <p className="text-gray-600 whitespace-pre-wrap">{report.factores_riesgo}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Identifiers */}
      {(report.numero_prodity || report.zonal) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Identificadores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.numero_prodity && (
                <div>
                  <p className="text-sm text-gray-500">Número Prodity</p>
                  <p className="font-medium">{report.numero_prodity}</p>
                </div>
              )}
              {report.zonal && (
                <div>
                  <p className="text-sm text-gray-500">Zonal</p>
                  <p className="font-medium">{report.zonal}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Classification */}
      <Card>
        <CardHeader>
          <CardTitle>Clasificación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {report.con_baja_il && (
              <Badge variant="default">Con Baja - Incapacidad Laboral</Badge>
            )}
            {report.sin_baja_il && (
              <Badge variant="secondary">Sin Baja - Incapacidad Laboral</Badge>
            )}
            {report.incidente_industrial && (
              <Badge variant="default">Incidente Industrial</Badge>
            )}
            {report.incidente_laboral && (
              <Badge variant="default">Incidente Laboral</Badge>
            )}
            {!report.con_baja_il && !report.sin_baja_il && !report.incidente_industrial && !report.incidente_laboral && (
              <p className="text-sm text-gray-500">Sin clasificación</p>
            )}
          </div>
        </CardContent>
      </Card>
{/* Photos from Incident */}      {incidentPhotos && incidentPhotos.length > 0 && (        <Card className="mt-6">          <CardHeader>            <CardTitle className="flex items-center gap-2">              <Camera className="h-5 w-5" />              Fotos del Incidente            </CardTitle>          </CardHeader>          <CardContent>            <PhotoGallery              photos={incidentPhotos}              loading={photosLoading}              showFinalReportToggle={false}            />          </CardContent>        </Card>      )}
    </div>
  )
}
